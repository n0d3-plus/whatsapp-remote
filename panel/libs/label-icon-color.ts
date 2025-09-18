import { SessionState } from "@src/types"
import { NodeActionType } from "@src/types/action-types"
import { SOCKET_STATE, SOCKET_STREAM } from "@src/waweb/WAWebSocketConstants"

const emptyKeyMap = ['...', 'unknown_med', 'grey-lighten-1']
const unknownKeyMap = ['Unknown', 'question_mark', 'grey-lighten-1']

function proxy<ENUM extends object>(enumObject: ENUM, mapObject: Record<keyof ENUM, [string, string, string]>) {
    return new Proxy(mapObject, {
        get(target, prop, receiver) {
            if (prop in enumObject) return target[enumObject[prop]]
            if (prop in target) return target[prop]
            else {
                if (prop == '__v_isRef') return false
                console.trace(`Empty or unknown key:`, typeof prop, prop)
                // console.trace()
                if (!prop) return emptyKeyMap
                return unknownKeyMap
            }
        }
    })
}

export const SessionStateMap = proxy(SessionState, {
    unknown: ['Unknown', 'help', 'grey'],
    stopped: ['Stopped', 'cancel', 'red'],
    starting: ['Starting', 'autoplay', 'amber'],
    syncing: ['Syncing', 'cloud_sync', 'blue'],
    need_auth: ['Need Auth', 'qr_code_scanner', 'indigo'],
    stopping: ['Stopping', 'hourglass_bottom', 'orange'],
    ready: ['Ready', 'task_alt', 'green'],
    error: ['Error', 'dangerous', 'red'],
})

export const WaSocketStateMap = proxy(SOCKET_STATE, {
    OPENING: ['Opening', 'hourglass_top', 'amber'],
    PAIRING: ['Pairing', 'key', 'indigo'],
    UNPAIRED: ['Unpaired', 'qr_code', 'deep-purple'],
    UNPAIRED_IDLE: ['Unpaired Idle', 'refresh', 'deep-purple'],
    CONNECTED: ['Connected', 'check_circle', 'green'],
    CONFLICT: ['Conflict', 'warning', 'orange'],
    UNLAUNCHED: ['Unlaunched', 'not_started', 'grey'],
    PROXYBLOCK: ['Proxyblock', 'block', 'red'],
    TOS_BLOCK: ['TOS Block', 'gavel', 'red'],
    SMB_TOS_BLOCK: ['SMB TOS Block', 'business', 'red'],
    DEPRECATED_VERSION: ['Deprecated Version', 'error', 'red'],
    SCREEN_LOCKED: ['Screen Locked', 'lock', 'grey-darken-1'],
})

export const WaStreamStateMap = proxy(SOCKET_STREAM, {
    DISCONNECTED: ['Disconnected', 'cancel', 'red'],
    SYNCING: ['Syncing', 'sync', 'amber'],
    RESUMING: ['Resuming', 'autorenew', 'blue'],
    CONNECTED: ['Connected', 'check_circle', 'green'],
})

export const NodeActionTypeMap = proxy(NodeActionType, {
    emitter: ['Emitter', 'bolt', 'amber'],
    conditional: ['Conditional', 'arrow_split', 'amber'],
    custom: ['Custom', 'data_object', 'blue'],
    remote: ['WA', 'business_messages', 'green'],
})