import type { MsgPayload } from "@src/types/apps-types";
import type { WsRemoteApiReq, WsRemoteApiRet } from "@src/types/remote-types";
import type { WorkerMessageMap } from "@src/types/worker-types";
import type { RemoteApi } from "./remote-api";

// let listenerId = 0
export class RemoteWs {
    private api: RemoteApi = undefined!
    public ws: WebSocket | null = null
    private reconnectAttempts = 0
    private forcedClose = false
    private activeJobs = new Map<number, [Function, Function, string]>()
    private lastJobIs = 0
    // private listeners = new Map<string, Set<((msg: any) => void)>>()

    constructor(public url: string) {
        if (!this.url) {
            throw new Error(`${this.constructor.name}: No URL to connect`)
        }
    }

    connect(cb?: (e?: Error) => void) {
        this.forcedClose = false
        this.ws = new WebSocket(this.url);
        this.ws.onopen = async (ev) => {
            this.reconnectAttempts = 0;

            // Load Remote Api
            if (!this.api) {
                import('./remote-api').then(({ remoteApi }) => this.api = remoteApi)
            }

            // Enable kernel
            await this.sendCommand('remote', true)
            if (cb) {
                cb()
                cb = undefined
            }
        }
        this.ws.onerror = (ev) => {
            if (cb) {
                cb()
                cb = undefined
            }
            console.warn(ev)
        }
        this.ws.onclose = (ev) => {
            console.debug('WS-REMOTE: Closed', ev)
            if (this.forcedClose) {
                return;
            }
            console.debug('WS-REMOTE: Reconnect WS in 2s')
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, 2000);
        };

        this.ws.onmessage = this.onMessage.bind(this)
    }

    // listen(event: string, cb: (arg: any /* Required<DebugWsData>[T] */) => any) {
    //     const id = ++listenerId;

    //     if (listenerId >= Number.MAX_SAFE_INTEGER)
    //         listenerId = 0

    //     if (this.listeners.has(event)) {
    //         this.listeners.get(event)?.add(cb)
    //     } else {
    //         this.listeners.set(event, new Set([cb]))
    //     }
    //     return () => this.listeners.get(event)?.delete(cb)
    // }
    private onMessage(ev: MessageEvent) {
        const data = ev.data;
        if (typeof data === 'string') {
            try {
                const json = JSON.parse(data);
                this.onJson(json);
            } catch (e) {
                console.debug('WS-REMOTE: JSON err', e, data)
            }
        } else {
            console.debug('WS-REMOTE: Unhandled', `${ev.data}`)
            //  if (data instanceof ArrayBuffer) {
            //     this.onBinary && this.onBinary(data);
            // } else if (data instanceof Blob) {
            //     this.onBlob && this.onBlob(data)
            // } else {
            //     console.log('UNKNOWN MESSAGE', data)
            // }
        }
    }

    send(msg: string) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(msg);
        } else {
            throw new Error('WS-REMOTE: WebSocket is not open');
        }
    }

    push(msg: MsgPayload) {
        // not need reply
        this.send(JSON.stringify([0, 'push', msg]))
    }

    onJson(json: any/* DebugWsData */) {
        // Array mean command response
        if (Array.isArray(json)) {
            if (json.length === 3) {
                this.handleCommandRequest(json as any)
            } else if (json.length == 2) {
                this.handleCommandResponse(json as any)
            } else {
                console.warn('WS-REMOTE: ignore Json Array', json)
            }
            return
        }
        console.debug(`WS-REMOTE: Ignored incoming msg`, json)

        // for (const eventName of keys) {
        //     if (this.listeners.has(eventName)) {
        //         this.listeners.get(eventName)!.forEach(
        //             v => v.call(null, json[eventName])
        //         )
        //     } else {
        //         console.debug(`WS-REMOTE: No one is listening for`, eventName)
        //     }
        // }
    }

    private async handleCommandRequest(msg: WsRemoteApiReq) {
        let reply: WsRemoteApiRet
        try {
            /// @ts-ignore
            const ret: any = await this.api[msg[1]]
                .apply(this.api, msg[2])
            reply = [msg[0], ret, null]
        } catch (error) {
            reply = [msg[0], null, error]
        }

        this.ws?.send(JSON.stringify([0, 'api', reply]))
    }

    private handleCommandResponse([jobId, result]: [number, any]) {

        if (!this.activeJobs.has(jobId)) {
            return console.warn(`WS-REMOTE: Unhandle jobId: ${jobId}`, result)
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

    async close() {
        await this.sendCommand('remote', false)
        this.forcedClose = true;
        if (this.ws) {
            this.ws.close();
        }
    }
}