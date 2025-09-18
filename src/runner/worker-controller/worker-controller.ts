import type { Worker } from "node:worker_threads"
import type { WorkerMessageMap, WorkerMessage } from "@worker-types"
import type { DataOptions, DataValues } from "@action-types"
import type { WebSocket } from "ws"
import type { WsRemoteApiReq, WsRemoteApiRet } from "@remote-types"
import type { MsgPayload } from "@apps-types"
import { Readable, type Transform } from "node:stream"
import { isSandboxError, sandboxToError, SequentialId } from "../worker/utils"
import { createWriteStream, type WriteStream } from "node:fs"
import { lineTransform } from "../utils/log-pipe"
import { logRotator } from "../utils/log-rotator"

export class WorkerController {
    private activeJobs = new Map<number, [Function, Function, string]>()
    private jobId = SequentialId()
    private consoleListeners = new Set<WebSocket>()
    private pushListeners = new Set<WebSocket>()
    private pipes?: Readable[]
    private transforms?: Transform[]
    private logFs?: WriteStream
    private remoteApi?: WebSocket

    constructor(
        public name: string,
        public worker: Worker,
        private logFile: string,
    ) {
        this.setupLogFile()
        this.worker.on('message', this.handleWorkerMessage)
        this.worker.once('exit', () => {
            // console.debug('WC exit', this.activeJobs)
            this.worker.off('message', this.handleWorkerMessage)
            // Reject all waiting task
            const err = new Error(`WorkerVM Exited`)
            for (const [id, [r, j, cmd]] of this.activeJobs) {
                console.warn(`Rejected job`, id, cmd)
                j(err)
            }
            this.activeJobs.clear()
            this.closeLogFile()
            this.worker = null;
        })
    }

    private async setupLogFile(flags = 'a') {
        if (!this.logFile)
            return

        await logRotator(this.logFile)

        this.logFs = createWriteStream(this.logFile, { flags })
        this.transforms = ['OUT', 'ERR'].map(v => lineTransform(v))
        this.pipes = [this.worker.stdout, this.worker.stderr].map(
            (v, i) => v.pipe(this.transforms[i])
        )
        // Pipe to files
        this.pipes.forEach(p => p.pipe(this.logFs, { end: true }))

        // Listen Ws Console listener (maybe restarted)
        if (this.consoleListeners.size > 0) {
            this.pipes.forEach(p => {
                p.on('data', this.workerConsoleHandler)
            })
        }
    }

    private async closeLogFile() {

        if (!this.logFile) return

        [this.worker.stdout, this.worker.stderr].forEach(
            (v, i) => {
                v.unpipe(this.logFs)
                this.pipes[i].unpipe(this.transforms[i])
            }
        )
        // Remove Ws Console listener
        if (this.consoleListeners.size > 0) {
            this.pipes.forEach(p => {
                p.off('data', this.workerConsoleHandler)
            })
        }
        await new Promise<void>((resolve) => {
            this.logFs.once('close', resolve);
            this.logFs.close();
        });
    }

    /** Truncate */
    async clearLogFile() {
        if (!this.logFile) return
        await this.closeLogFile()
        await this.setupLogFile('w')
    }

    toJSON() {
        return {
            name: this.name,
            logFile: this.logFile
            // workerId: this.workerId,
            // activeJobs: [...this.activeJobs.keys()]
        }
    }
    private workerConsoleHandler = (chunk: Buffer) => {
        this.consoleListeners.forEach(c => {
            c.send(chunk, { binary: true })
        })
    }

    onConsole(ws: WebSocket) {
        this.consoleListeners.add(ws)
        if (this.consoleListeners.size == 1) {
            (this.pipes || [this.worker.stdout, this.worker.stderr])
                .forEach(p => {
                    p.on('data', this.workerConsoleHandler)
                })
        }
        return this.consoleListeners.size
    }

    offConsole(ws: WebSocket) {
        if (!this.consoleListeners.has(ws)) return
        this.consoleListeners.delete(ws)
        if (this.consoleListeners.size == 0) {
            const pipes = this.pipes || [this.worker.stdout, this.worker.stderr]
            pipes.forEach(p => {
                p.off('data', this.workerConsoleHandler)
            })
        }
    }

    onPush(ws: WebSocket) {
        this.pushListeners.add(ws)
    }

    offPush(ws: WebSocket) {
        this.pushListeners.delete(ws)
    }

    async destroy() {
        this.consoleListeners.forEach(c => {
            this.offConsole(c)
        })
        await this.sendToSandbox('exit');
    }

    private handleWorkerMessage = (msg: WorkerMessage['response'] | WsRemoteApiReq[]) => {

        if (!msg || typeof msg !== 'object') return // ignored

        if(Array.isArray(msg)){
            // Is Remote API command from worker
            if( msg.length === 3){
                this.sendRemoteCommand(msg as any)
                return
            }
        }else if ('jobId' in msg) {
            if (!this.activeJobs.has(msg.jobId)) {
                console.warn(`Unhandle jobId: ${msg.jobId}`, msg)
                return
            }

            // console.debug('res', msg)
            const [resolve] = this.activeJobs.get(msg.jobId)

            this.activeJobs.delete(msg.jobId)
            resolve(msg.result)
            return
        }
        console.debug('[RUNNER.WORKER-CONTROLLER] Unknown worker message', msg)
    }

    private sendRemoteCommand(msg: WsRemoteApiReq) {
        this.remoteApi?.send(JSON.stringify(msg))
    }

    handleRemoteResponse(msg: WsRemoteApiRet) {
        this.worker.postMessage(msg)
    }

    setRemoteWs(ws: WebSocket, enable: boolean) {
        if (enable) {
            this.remoteApi = ws
            this.worker.postMessage([0, true, ])
            // Also enable the kernel
            return this.sendToSandbox('kernel', true)
        } else {
            this.worker.postMessage([0, false, ])
            this.remoteApi = undefined
            return Promise.resolve(true)
        }
    }

    pushToSandbox(msg: MsgPayload) {
        this.worker.postMessage(
            { cmd: 'push', param: msg } as WorkerMessageMap['push']['request']
        )
        if (this.pushListeners.size) {
            const json = JSON.stringify({ pushEvent: msg })
            this.pushListeners.forEach(ws => ws.send(json))
        }
    }

    /** Request reply style */
    sendToSandbox<T extends keyof WorkerMessageMap>(cmd: T, args?: WorkerMessageMap[T]['request']['param']): Promise<WorkerMessageMap[T]['response']['result']> {

        if (cmd == 'push') {
            return Promise.reject(`Use pushToSandbox to start workflow.`)
        }

        const jobId = this.jobId.next().value

        return new Promise((r, j) => {
            this.activeJobs.set(jobId, [r, j, cmd])
            this.worker.postMessage(
                { jobId, cmd, param: args } as WorkerMessageMap[T]['request']
            )
        })
    }

    run(nodeId: string, consumes: DataValues<DataOptions>, pid = 0, eid = 0) {

        if (!this.worker)
            throw new Error(`Worker not started`)

        return this.sendToSandbox('run', {
            nodeId, consumes, pid, eid
        }).then(v => isSandboxError(v) ? Promise.reject(sandboxToError(v)) : v)
    }

}