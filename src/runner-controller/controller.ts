import type { ChildProcess, SendHandle } from "node:child_process";
import type { IpcMessage, ManagerFunctions, IpcMessageInvokeMap, IpcMessageReturnMap } from "@runner-types"

export class RunnerController {

    private activeReqs = new Map<number, [Function, Function, ManagerFunctions]>()
    private lastReqId = 0

    onWorkerStoped?: (name: string) => void
    // public activeWorkers = new Map<number/* SessionID */, {workerName: string}>()

    constructor(private runnerProcess: ChildProcess, private listenPort: number) {
        runnerProcess.on('message', this.ipcReceive)
        runnerProcess.once('exit', () => {
            console.log('[RUNNER-CONTROLLER] Runner exit')
            runnerProcess.off('message', this.ipcReceive)
            // Reject all waiting task
            const err = new Error(`Runner exit`)
            for (const [r, j, cmd] of this.activeReqs.values()) {
                j(err)
            }
            this.activeReqs.clear()
            this.runnerProcess = null
        })
    }

    getEndpoint() {
        return `http://127.0.0.1:${this.listenPort}`
    }

    getWorkerWsUrl(name: string) {
        return `ws://127.0.0.1:${this.listenPort}/${encodeURIComponent(name)}/bind`
    }

    ipcSend<T extends ManagerFunctions>(func: T, args?: IpcMessageInvokeMap[T]['args']): Promise<IpcMessageReturnMap[T]['ret']> {

        if (!this.runnerProcess) {
            return Promise.reject(new Error('ProcessClient is destroyed'))
        }

        const reqId = ++this.lastReqId
        if (this.lastReqId >= Number.MAX_SAFE_INTEGER)
            this.lastReqId = 0 // Reset counter

        return new Promise((r, j) => {
            this.activeReqs.set(reqId, [r, j, func])
            this.runnerProcess.send({ type: 'invoke', reqId, func, args } as IpcMessage)
        })
    }

    private ipcReceive = (msg: IpcMessage, _sendHandle: SendHandle) => {
        if (typeof msg != 'object') return // Ignore

        switch (msg.type) {
            // Invoke return
            case 'return':
                if (!this.activeReqs.has(msg.reqId)) {
                    console.warn(`Unhandled reqId ${msg.reqId}`, msg)
                    return
                }
                const [resolve, reject, _func] = this.activeReqs.get(msg.reqId)
                this.activeReqs.delete(msg.reqId)
                if (msg.err) {
                    reject(msg.err)
                } else {
                    resolve(msg.ret)
                }
                break
            case 'workerStoped':
                this.onWorkerStoped && this.onWorkerStoped(msg.name)
                break
            case 'ready': // just ignore
                break;
            default:
                console.warn(`Unhandle event from Runner:`, msg)
                break;
        }
    }
}