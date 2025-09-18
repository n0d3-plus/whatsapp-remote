import { nextTick, ref } from "vue";
import type { WsData } from "../../src/types";
import { Ws } from "../libs/ws";

// todo: move ws types into type file
type WsOptions = {
    reconnectInterval?: number; // milliseconds
    maxRetries?: number;
    protocols?: string | string[];
};

export enum WsState {
    disconnected,
    connecting,
    connected,
}

const state = ref(WsState.disconnected)
type EventNames = keyof WsData

export class WsApi extends Ws<WsData> {
    private listeners = new Map<EventNames, Set<((msg: any) => void)>>()
    /** listeners last values */
    public wsData: WsData = {}

    constructor(url: string, options: WsOptions = {}) {
        super(state, url, options)
    }

    listen<T extends EventNames>(event: T, cb: (arg: Required<WsData>[T]) => any) {
        if (this.listeners.has(event)) {
            this.listeners.get(event)?.add(cb)
        } else {
            this.listeners.set(event, new Set([cb]))
        }
        // Immediate trigger the event
        if (event in this.wsData) {
            nextTick(() => cb(this.wsData[event] as any))
        }
        return () => this.listeners.get(event)?.delete(cb)
    }

    onJson(json: WsData) {
        const keys: EventNames[] = Object.keys(json) as any

        for (const eventName of keys) {

            this.wsData[eventName] = json[eventName] as any

            if (this.listeners.has(eventName)) {
                this.listeners.get(eventName)!.forEach(
                    v => v.call(null, json[eventName])
                )
            } else {
                console.debug(`No event handler for`, eventName)
            }
        }
    }

    getRunnerUrl() {
        return this.wsData.runner_workers_endpoints
    }
}

let ws: WsApi

export function useWsApi() {
    if (!ws) {
        const wsUrl = `${location.protocol.startsWith('https') ? 'wss' : 'ws'}://${location.host}/ws`
        ws = new WsApi(wsUrl)
    }

    return { ws, state }
}

export function useWsApiState() {
    return { state }
}
