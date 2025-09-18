import type { WsRemoteApiReq, WsRemoteApiRet } from "@remote-types";
import { parentPort } from "node:worker_threads";
import { SequentialId } from "./utils";

export class RemoteApiBridge {
    private activeJobs = new Map<number, [Function, Function, string]>()
    private jobId = SequentialId()
    private hasWhatsappWebRemote = false

    destroy() {
        this.hasWhatsappWebRemote = false
        const err = new Error(`RemoteApi Destroyed`)
        for (const [id, [r, j, cmd]] of this.activeJobs) {
            console.warn(`Rejected job`, id, cmd)
            j(err)
        }
        this.activeJobs.clear()
    }

    sendCommand(cmd: WsRemoteApiReq[1], args?: WsRemoteApiReq[2]) {
        if (!this.hasWhatsappWebRemote)
            return Promise.reject('Whatsapp Web is not available')

        const jobId = this.jobId.next().value
        return new Promise((r, j) => {
            this.activeJobs.set(jobId, [r, j, cmd])
            parentPort.postMessage([jobId, cmd, args])
        })
    }

    handleResponse(msg: WsRemoteApiRet) {
        if (!this.activeJobs.has(msg[0])) {
            // it is connect notif
            if (msg[0] === 0) {
                this.hasWhatsappWebRemote = msg[1];
            } else {
                console.warn(`[REMOTE-API-BRIDGE] Unhandled jobId: ${msg[0]}`, msg)
            }
            return
        }

        const [resolve, reject] = this.activeJobs.get(msg[0])
        this.activeJobs.delete(msg[0])
        if (msg[2]) {
            reject(msg[2])
        } else {
            resolve(msg[1])
        }

    }

}