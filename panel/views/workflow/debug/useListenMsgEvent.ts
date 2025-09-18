import { ref, type Ref } from "vue";
import { useWsWorker, type WsWorker } from "../../../uses/ws-worker";
import { WsState } from "../../../libs/ws";
import type { MsgPayload } from "@src/types/apps-types";



export async function useListenMsgEvents(sessionId: number, onMsg: (msg: MsgPayload) => void) {
    const state = ref(WsState.disconnected)
    const { ws } = await useWsWorker(sessionId, state)
    ws.listen('pushEvent', onMsg)
    ws.sendCommand('subscribePush')
    const off = () => {
        ws.sendCommand('unsubscribePush')
        ws.close()
    }

    return { state, ws, off }
}
