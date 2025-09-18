import url from "node:url";
import { WebSocketServer, type RawData, type WebSocket } from "ws";
import type { WsData } from "../types";
import type { Server } from "node:http";


export type WsClient = WebSocket & { sendData(o: WsData): void }
export class WsServer {
    wsServer: WebSocketServer
    clients = new Set<WsClient>();
    handler = new Map<string, (client: WsClient, ...args: any) => (any | Promise<any>)>()
    onNewClient: ((ws: WsClient) => void)[] = []

    constructor(server: Server) {
        this.wsServer = new WebSocketServer({ server })
        this.wsServer.on('connection', (ws, req) => {
            const location = url.parse(req.url, true)
            console.log('🟢 New WS Client', location.pathname)

            const wsc = Object.assign(ws, {
                sendData(this: WebSocket, o: WsData) {
                    this.send(JSON.stringify(o))
                }
            })

            this.clients.add(wsc)
            wsc.on('message', this.handleClientMessage.bind(this, wsc))
            wsc.on('close', () => {
                console.debug('🔴 Closed WS Client')
                this.clients.delete(wsc)
            })

            for (const f of this.onNewClient) {
                try {
                    f(wsc)
                } catch (error) {
                    console.error(error)
                    return wsc.close(1008, 'Error not ready');
                }
            }
        });
    }

    private async handleClientMessage(ws: WsClient, message: RawData, isBinary: boolean) {

        // console.debug('📨 Received:', message.toString());

        if (isBinary) {
            console.debug(`Ignored WS Binary: ${message}`)
            return
        }
        const str = message.toString()
        // if( !(message instanceof Buffer)){
        //     console.debug(`Ignored WS 1:`, message.toString())
        // }
        if (str[0] != '[') {
            // console.debug(`Ignored WS:`, message)
            return
        }

        let cmd
        try {
            // 1 cmd, 2 args ...
            const [_cmd, ...args] = JSON.parse(str)
            cmd = _cmd
            if (this.handler.has(cmd)) {
                this.handler.get(cmd)(ws, ...args)
                // let ret = this.handler.get(cmd)(ws, ...args)

                // if (ret instanceof Promise)
                //     ret = await ret

                // if (ret !== undefined) {
                //     ws.send(JSON.stringify({ [cmd]: ret }))
                // }
            }
        } catch (error) {
            ws.send(JSON.stringify({ [cmd]: { error } }))
            console.warn(`Err WS: ${error.message}`)
        }
    }

    broadcast(msg: WsData) {
        // if (SHUTTING_DOWN) return
        for (const client of this.clients) {
            if (client.readyState === 1) client.sendData(msg);
        }
    }

}
