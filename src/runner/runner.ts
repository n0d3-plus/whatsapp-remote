import { startWorker } from "./worker-controller"
import { WebSocket, WebSocketServer, type RawData } from "ws"
import type { SendHandle } from "node:child_process"
import type { IncomingMessage, Server } from "node:http"
import type { WorkerConfig, WorkerMessageMap } from "../types/worker-types"
import type { IpcMessage, RunnerWatchDog } from "../types/runner-types"
import { WorkerController } from "./worker-controller/worker-controller"
import appConfig from "../config"
import { resolve } from "node:path"
import fs from "node:fs";
import { sandboxError } from "./worker/utils"

if (!fs.existsSync(appConfig.workerLogsDir)) {
    console.debug(`Creating data dir: ${appConfig.workerLogsDir}`)
    fs.mkdirSync(appConfig.workerLogsDir, { recursive: true })
}


/**
 * Workflow action executor
*/
export class Runner {
    public workers = new Map<string/* workerName */, WorkerController>
    private workersWatchdogs = new Map<string/* workerName */, RunnerWatchDog>()
    private workersWsClients = new Map<string/* workerName */, Set<WebSocket>>()
    private serverWs: WebSocketServer

    constructor(private server: Server) {
        this.serverWs = new WebSocketServer({ server })

        server.once('listening', () => {
            const listenPort = server.address()?.['port']
            if (!listenPort) throw new Error('No listen port!')

            // tell parent process if we are ready now
            this.sendToParentController({ type: 'ready', port: listenPort })
        })

        this.serverWs.on('connection', (ws: WebSocket, req: IncomingMessage) => {

            const segments = (req.url || '/').slice(1).split('/').map(v => v?.trim()).filter(Boolean)
            if (!segments || segments.length != 2) {
                return ws.close(1008, 'Invalid URL');
            }
            const [workerName, action] = segments

            switch (action) {
                case 'bind':
                    if (!this.bindWorkerToWebsocket(ws, workerName)) {
                        ws.close(1008, 'Invalid WorkerID');
                    }
                    break
            }
        })

        process.on('message', this.handleIpcMessage)
    }

    private watchdogCheck(workerName: string) {
        if (!this.workersWatchdogs.has(workerName)) return
        const clients = this.workersWsClients.get(workerName)?.size || 0
        const wdt = this.workersWatchdogs.get(workerName)
        if (clients > 0) {
            if (wdt.timer) {
                clearTimeout(wdt.timer)
                delete wdt.timer
                console.debug(`[RUNNER.WORKER.${workerName}]: Destroy timer canceled`);
            }
        } else {
            if (wdt.timer) clearTimeout(wdt.timer)
            wdt.timer = setTimeout(() => {
                this.workers.get(workerName)?.destroy()
            }, wdt.wsTimeoutSecond * 1000)
            console.debug(`[RUNNER.WORKER.${workerName}]: No WS client, will destroyed in ${wdt.wsTimeoutSecond} second`);
        }
    }

    private bindWorkerToWebsocket(ws: WebSocket, workerName: string) {
        if (!workerName || !this.workers.has(workerName)) {
            return false;
        }

        const wsListener = this.websocketToWorkerHandler.bind(this.workers.get(workerName), ws)

        ws.on('message', wsListener);
        ws.on('close', () => {
            ws.off('message', wsListener)
            const clients = this.workersWsClients.get(workerName)
            if (!clients) return

            clients.delete(ws)
            console.debug(`[RUNNER.WORKER.${workerName}]: WS close, remaining listener: ${clients.size}`);
            if (clients.size == 0) {
                this.watchdogCheck(workerName)
                this.workersWsClients.delete(workerName)
            }
            const worker = this.workers.get(workerName)
            if (worker) {
                worker.offConsole(ws)
            }
        })

        if (this.workersWsClients.has(workerName)) {
            this.workersWsClients.get(workerName).add(ws)
        } else {
            this.workersWsClients.set(workerName, new Set([ws]))
        }
        this.watchdogCheck(workerName)
        console.log('[RUNNER]: WebSocket Bind %s', workerName);
        return true
    }

    private websocketToWorkerHandler<T extends keyof WorkerMessageMap>(this: WorkerController, ws: WebSocket, data: RawData, isBinary: boolean) {

        if (isBinary)
            return console.warn(`[RUNNER] WsToWorker ignore: IS BINARY`)

        if (!(data instanceof Buffer))
            return console.warn(`[RUNNER] WsToWorker ignore: NOT NUFFER`)

        if (!data || data?.[0] != 91 /* ASCII of `[` */)
            return console.warn(`[RUNNER] WsToWorker ignore: NOT JSON ARRAY`)

        let parsed: [string, T, WorkerMessageMap[T]['request']['param']]

        try {
            parsed = JSON.parse(data.toString('utf8'))
        } catch (error) {
            console.warn(`[RUNNER] WsToWorker parse:`, error)
            return
        }
        if (!Array.isArray(parsed)) {
            console.warn(`[RUNNER] WsToWorker parse: NOT ARRAY`)
            return
        }

        switch (parsed[1]) {
            case 'subscribeConsole':
                this.onConsole(ws)
                ws.send(JSON.stringify([parsed[0], true]))
                break
            case 'unsubscribeConsole':
                this.offConsole(ws)
                ws.send(JSON.stringify([parsed[0], true]))
                break
            case 'subscribePush':
                this.onPush(ws)
                ws.send(JSON.stringify([parsed[0], true]))
                break
            case 'unsubscribePush':
                this.offPush(ws)
                ws.send(JSON.stringify([parsed[0], true]))
                break
            case 'clearLog':
                this.clearLogFile().then(
                    () => ws.send(JSON.stringify([parsed[0], true]))
                )
                break
            case 'push':
                this.pushToSandbox(parsed[2] as any)
                break
            case 'remote':
                this.setRemoteWs(ws, parsed[2] as any).then(
                    () => ws.send(JSON.stringify([parsed[0], true]))
                )
                break
            case 'api':
                this.handleRemoteResponse(parsed[2] as any)
                break
            default:
                this.sendToSandbox(parsed[1], parsed[2]).then(
                    res => {
                        ws.send(JSON.stringify([parsed[0], res]))
                    }
                ).catch(err => {
                    console.warn(`[RUNNER] WsToWorker failed:`, err)
                })
                break
        }
    }

    private handleIpcMessage = async (msg: IpcMessage, sendHandle: SendHandle) => {

        if (typeof msg != 'object' || !msg) return

        // console.debug('[RUNNER] Msg ', msg)

        switch (msg.type) {
            case 'invoke':
                let reply: IpcMessage
                try {
                    let ret = this[msg.func].apply(this, msg.args)
                    if (typeof ret?.then == 'function') {
                        ret = await ret
                    }
                    reply = {
                        type: 'return',
                        reqId: msg.reqId,
                        ret
                    }
                } catch (err) {
                    reply = {
                        type: 'return',
                        reqId: msg.reqId,
                        ret: undefined,
                        err: sandboxError(err)
                    }
                } finally {
                    this.sendToParentController(reply)
                }
                // console.debug(msg, reply)
                break
            default:
                console.warn(`[RUNNER]: Unhandled msg`, msg)
                break;
        }
    }

    private sendToParentController(msg: IpcMessage) {
        if (!process.send) {
            return console.warn(`[RUNNER] No parent process`)
        }
        return process.send(msg)
    }

    async destroy() {
        for (const worker of this.workers.values()) {
            await worker.destroy()
        }
        process.off('message', this.handleIpcMessage)
        this.server.close()
    }

    async startWorker(workerName: string, workerConfig?: WorkerConfig, watchdog?: RunnerWatchDog) {

        if (this.workers.has(workerName)) {
            throw new Error(`Worker with name ${workerName} already running.`)
        }
        const logPrefix = `[RUNNER.WORKER.${workerName}]`
        console.time(logPrefix)
        console.timeLog(logPrefix, '🟠 Starting')

        const logFilePath = resolve(appConfig.workerLogsDir, `${workerName}.log`)
        const historyFilePath = resolve(appConfig.workerLogsDir, `${workerName}.json.log`)

        const workerController = await new Promise<WorkerController>((r, j) => {
            let timer = setTimeout(() => {
                console.debug(logPrefix, '🔴 Timeout')
                j(new Error('Worker startup timeout'))
                try {
                    if (workerController)
                        workerController.destroy()
                } catch (error) { console.error(logPrefix, error) }
            }, 3000)

            startWorker(workerName, workerConfig, logFilePath, historyFilePath, true)
                .then((workerController) => r(workerController))
                .catch(err => j(err))
                .finally(() => clearTimeout(timer))
        }).catch(err => {
            console.timeLog(logPrefix, '🔴', err)
            console.timeEnd(logPrefix)
            return Promise.reject(err)
        })

        this.workers.set(workerName, workerController)

        workerController.worker.once('exit', () => {
            console.debug(logPrefix, '🔴 Exit')
            this.sendToParentController({ type: 'workerStoped', name: workerName })
            // remove related ws
            if (this.workersWsClients.has(workerName)) {
                this.workersWsClients.get(workerName).forEach(
                    ws => ws.close()
                )
                this.workersWsClients.delete(workerName)
            }
            this.workers.delete(workerName)
            this.workersWatchdogs.delete(workerName)
        })

        console.timeLog(logPrefix, '🟢 Started', workerController.worker.threadId)
        console.timeEnd(logPrefix)
        if (watchdog) {
            this.workersWatchdogs.set(workerName, watchdog)
            this.watchdogCheck(workerName)
        }
        return workerController//.toJSON()
    }

    updateWorkerConfig(workerName: string, config: WorkerConfig) {
        const controller = this.workers.get(workerName)
        if (!controller) return false
        return controller.sendToSandbox('replaceConfig', config)
    }
}
