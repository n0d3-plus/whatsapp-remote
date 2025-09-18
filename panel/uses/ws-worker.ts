import { watch, type Ref } from "vue";
import { WsState } from "./ws-api";
import { Ws } from "../libs/ws";
import type { WorkerMessageMap } from "@src/types/worker-types";

type EventNames = string
let listenerId = 0

export class WsWorker extends Ws {
    private activeJobs = new Map<number, [Function, Function, string]>()
    private lastJobIs = 0
    private listeners = new Map<EventNames, Set<((msg: any) => void)>>()

    listen<T extends EventNames>(event: T, cb: (arg: any /* Required<DebugWsData>[T] */) => any) {
        const id = ++listenerId;

        if (listenerId >= Number.MAX_SAFE_INTEGER)
            listenerId = 0

        if (this.listeners.has(event)) {
            this.listeners.get(event)?.add(cb)
        } else {
            this.listeners.set(event, new Set([cb]))
        }
        return () => this.listeners.get(event)?.delete(cb)
    }

    onJson(json: any/* DebugWsData */) {
        const keys: EventNames[] = Object.keys(json) as any

        // Array mean command response
        if (Array.isArray(json)) {
            if (json.length == 2) {
                this.handleCommandResponse(json as any)
            } else {
                console.warn('ignore Json Array', json)
            }
            return
        }

        for (const eventName of keys) {
            if (this.listeners.has(eventName)) {
                this.listeners.get(eventName)!.forEach(
                    v => v.call(null, json[eventName])
                )
            } else {
                console.debug(`WS-WORKER: No one is listening for`, eventName)
            }
        }
    }

    private handleCommandResponse([jobId, result]: [number, any]) {

        if (!this.activeJobs.has(jobId)) {
            return console.warn(`Unhandle jobId: ${jobId}`, result)
        }

        const [resolve] = this.activeJobs.get(jobId)!
        this.activeJobs.delete(jobId)
        resolve(result)
    }

    sendCommand<T extends keyof WorkerMessageMap>(cmd: T, args?: WorkerMessageMap[T]['request']['param']): Promise<WorkerMessageMap[T]['response']['result']> {
        const jobId = ++this.lastJobIs

        // Reset counter
        if (this.lastJobIs >= Number.MAX_SAFE_INTEGER)
            this.lastJobIs = 0

        return new Promise((r, j) => {
            this.activeJobs.set(jobId, [r, j, cmd])
            this.send(JSON.stringify([jobId, cmd, args]))
        })
    }

}

/** Connect ws worker and resolve after it first connected */
function connectWsWorker(state: Ref<WsState>, url: string): Promise<WsWorker> {
    return new Promise<WsWorker>(async (resolve, reject) => {
        const u = watch(state, (v) => {
            if (v == WsState.connected) {
                resolve(ws)
                u()
            }
        })
        const ws = new WsWorker(state, url, { binaryType: 'arraybuffer' })
    })
}

export async function useWsWorker(sessionId: number, state: Ref<WsState>, debug = false) {
    state.value = WsState.disconnected
    const initUrl = debug ? `/worker-debug/${sessionId}` : `/worker/${sessionId}`
    // Get worker WS URL or start it (if debug)
    const endpoint = await fetch(initUrl)
        .then<{ url: string, workerName: string }>(res => {
            if (res.status != 200) {
                return res.json().then(res => Promise.reject(new Error('WsWorker: ' + res.error || res.message || res)))
            } else {
                return res.json()
            }
        })
    const ws = await connectWsWorker(state, endpoint.url)
    return Object.assign(endpoint, { ws })
}

export function useWsWorkerDebug(sessionId: number, state: Ref<WsState>) {
    return useWsWorker(sessionId, state, true)
}