import { Kernel } from "@src/runner/worker/kernel.ts"
import { Storage } from "../../../uses/storage"
import { useWsWorkerDebug, type WsWorker } from "../../../uses/ws-worker"
import type { Executor, WorkerConfig } from "@src/types/worker-types"
import { WsState } from "../../../libs/ws"
import { type Ref } from "vue"
import { sandboxError } from "@src/runner/worker/utils"

export class KernelDebug extends Kernel {
    workerName: string = ''
    ws: WsWorker | null = null
    waitReady: Promise<any> = null!
    private onFirstReadyResolve?: Function
    wsUrl?: URL
    private decoder = new TextDecoder('utf-8');

    constructor(private sessionId, private wsState: Ref<WsState>) {
        super({ nodes: {}, chains: [] } as any, Storage.actions)
        this.waitReady = new Promise(r => this.onFirstReadyResolve = r)
    }

    getLogUrl(kibToFetch: number = 50) {
        const bytesToFetch = kibToFetch * 1024;
        return `${location.protocol}//${this.wsUrl?.host}/worker-log/${encodeURIComponent(this.workerName)}/${bytesToFetch}`
    }

    onConsole?: (line: string) => void = () => { }

    async start() {
        const { workerName, ws, url } = await useWsWorkerDebug(this.sessionId, this.wsState)
        if (this.onConsole) {
            ws.onBinary = (data) => this.onConsole!(this.decoder.decode(data))
        }

        this.wsUrl = new URL(url)
        this.ws = ws
        this.workerName = workerName
        this.onFirstReadyResolve && this.onFirstReadyResolve(true)
        this.onFirstReadyResolve = undefined

        this.ws.sendCommand('subscribeConsole')
    }

    stop() {
        if (this.ws) {
            this.ws.sendCommand('unsubscribeConsole')
            this.ws.close()
            this.ws = null
        }
        this.clear()
    }

    updateConfig = async (config: WorkerConfig) => {

        if (!this.ws) {
            console.warn(`[KernelDebug] Update config but ws isn't ready`)
            return
        }

        this.config = config
        this.onConfigUpdated()
        await this.ws.sendCommand('replaceConfig', config)
            .then(res => console.debug('WorkerDebug: config replaced'))
    }

    executor: Executor = (param) => {

        if (!this.ws) {
            console.warn(`[KernelDebug] Exec but ws isn't ready`)
            return Promise.resolve(sandboxError(new Error('No WS Executor')))
        }

        return this.ws.sendCommand('run', param)!
    }
}