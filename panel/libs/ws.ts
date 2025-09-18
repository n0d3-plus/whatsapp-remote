import { type Ref } from "vue";

// todo: move ws types into type file
export type WsOptions = {
    reconnectInterval?: number; // milliseconds
    maxRetries?: number;
    protocols?: string | string[];
    binaryType?: BinaryType
};

export enum WsState {
    disconnected,
    connecting,
    connected,
}
export class Ws<T = any> {
    private options: WsOptions;
    public ws: WebSocket | null = null;
    private reconnectAttempts = 0;
    private forcedClose = false;

    onBlob?: (data: Blob) => void
    onBinary?: (data: ArrayBuffer) => void
    onJson?(json: T): void

    constructor(public state: Ref<WsState>, public url: string, options: WsOptions = {}) {
        if (!this.url) {
            throw new Error(`${this.constructor.name}: No URL to connect`)
        }
        // console.log(new.target)
        state.value = WsState.disconnected
        this.options = {
            reconnectInterval: 5000,
            maxRetries: Infinity,
            ...options,
        };
        // console.debug(`WS:${this.constructor.name} New: ${this.url}`, arguments)
        this.connect();
    }

    private connect() {
        console.debug(`WS:${this.constructor.name} connecting to:`, this.url)
        this.forcedClose = false
        this.state.value = WsState.connecting
        this.ws = new WebSocket(this.url, this.options.protocols);
        this.ws.binaryType = this.options.binaryType || "blob"

        this.ws.onopen = (ev) => {
            this.reconnectAttempts = 0;
            this.state.value = WsState.connected
            // if (this.onOpen) this.onOpen(ev);
        };

        this.ws.onclose = (ev) => {
            this.state.value = WsState.disconnected
            if (this.forcedClose) {
                return;
            }
            console.debug('Reconnect to', this.url, ' in ', this.options.reconnectInterval)
            if (this.options.maxRetries! > this.reconnectAttempts) {
                this.state.value = WsState.connecting
                setTimeout(() => {
                    this.reconnectAttempts++;
                    this.connect();
                }, this.options.reconnectInterval);
            }
        };

        this.ws.onmessage = this.onMessage.bind(this)

        this.ws.onerror = (ev) => {
            // if (this.onError) this.onError(ev);
            console.warn(ev)
            // Let the error propagate and close will trigger reconnect
        };
    }

    private onMessage(ev: MessageEvent) {
        const data = ev.data;
        if (typeof data === 'string') {
            try {
                const json = JSON.parse(data);
                this.onJson && this.onJson(json);
            } catch (e) {
                console.debug('JSON err', e, data)
            }
        } else if (data instanceof ArrayBuffer) {
            this.onBinary && this.onBinary(data);
        } else if (data instanceof Blob) {
            this.onBlob && this.onBlob(data)
        } else {
            console.log('UNKNOWN MESSAGE', data)
        }
    }

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            throw new Error('WebSocket is not open');
        }
    }

    close() {
        this.forcedClose = true;
        if (this.ws) {
            this.ws.close();
        }
    }
}
