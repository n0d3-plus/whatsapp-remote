import { SOCKET_STATE, SOCKET_STREAM } from "./waweb/WAWebSocketConstants"

import type { MouseButton, SupportedBrowser } from "puppeteer-core"
import type { FlowExportObject } from "@vue-flow/core"
import type { SessionModelData } from "./remote/storage/sessions.storage"

/**
 * Browser eveent button To Puppeteer button code
 */
export const mouseButtonMap: MouseButton[] = [
    /* 0 */ 'left',
    /* 1 */ 'middle',
    /* 2 */ 'right',
    /* 3 */ 'back',
    /* 4 */ 'forward',
]

export enum SessionState {
    unknown,
    stopped,
    stopping,
    /** Starting wa web */
    starting,
    need_auth,
    /** Loading chats on startup */
    syncing,
    ready,
    error,
}

export interface SessionConfig {
    id: number
    name: string
    /** Whatsapp account ID if already linked */
    account?: {
        user: string
        device: number
        name: string
        image: string
        platform: string
    }
    lastWaWebVersion?: string
    dataDir: string
    browser?: SupportedBrowser
    executablePath?: string
    userAgent?: string,
    headless?: boolean
    debugWAEvents?: boolean
    devtools?: boolean
    disableVersionLock?: boolean
    args?: string[]
    screencastFullFps?: boolean
    screencastQuality?: number
    screencastFormat?: 'jpeg' | 'png' | string
    workflowEnabled?: boolean,
    /** Is the last state is started, then autostart is true */
    autoStart?: boolean
}

export interface WorkflowData {
    id: string
    // version: string
    /** Workflow version named by user */
    versionName?: string
    timestamp: number
    sessionId: number,
    flow: FlowExportObject
}

export enum RemoteError {
    /** Not getting WA module in initial startup */
    TIMEOUT_NO_WAWEB,
}
export interface WaStates {
    /** Generic custom state events */
    event: 'cmd_load' | 'me_ready',
    /** Socket state */
    state: SOCKET_STATE,
    /** Socket stream */
    stream: SOCKET_STREAM,
    remote_error?: RemoteError,
    qrcode: null | string,
    paircode: null | string,
    user: null | string,
    device: null | number,
    name: null | string,
    image: null | string
    platform: null | string,
    version: null | string,
    unread: null | number
    viewport?: {
        width: number
        height: number
        pixelRatio: number
    },
}

export type WaStates_V = WaStates & {
    // Virtual types
    ready?: Partial<WaStates>
}

export type WaStatesFunc = <T extends keyof WaStates_V>(stateName: T, value: WaStates_V[T]) => void

export const WaStatesNull: () => WaStates = () => ({
    event: null,
    state: SOCKET_STATE.UNLAUNCHED,
    stream: SOCKET_STREAM.DISCONNECTED,
    user: null,
    device: null,
    name: null,
    image: null,
    platform: null,
    version: null,
    unread: null,
    qrcode: null,
    paircode: null,
    viewport: null,
})

/** All data that possibly sent through websocket to client UI */
export interface WsData {
    db?: SessionModelData
    session_states?: [
        number /** Session ID */,
        SessionState
    ][]
    wa_states?: [
        number /** Session ID */,
        WaStates
    ][]
    screen_share_stop?: number
    runner_workers_endpoints?: string
    /** list of active worker names */
    active_workers?: string[]
    // qrcode?: [
    //     number /** Session ID */,
    //     string
    // ][]
}