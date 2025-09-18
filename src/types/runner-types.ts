import type { FunctionKeys } from "@helper-types"
import type { SandboxError } from "@worker-types"
import type { Runner } from "../runner/runner"

export type ManagerFunctions = FunctionKeys<Runner>

type IpcReq = { reqId: number }

export type IpcMessageInvokeMap = {
    [K in ManagerFunctions]: {
        func: K
        args: Parameters<Runner[K]>
    } & IpcReq
}

export type IpcMessageReturnMap = {
    [K in ManagerFunctions]: {
        ret: Awaited<ReturnType<Runner[K]>>
        err?: SandboxError
    } & IpcReq
}

/**
 * IPC Message between main process and runner process
 */
type IpcMessageDefinitions = {
    /** Runner ready */
    ready: {
        port: number
    },
    // workerStarted: {name: string, ws: string}
    workerStoped: { name: string }
    /** Invoke Manager's function */
    invoke: IpcMessageInvokeMap[keyof IpcMessageInvokeMap]
    return: IpcMessageReturnMap[keyof IpcMessageReturnMap]
}

type IpcMessageMap = {
    [K in keyof IpcMessageDefinitions]: {
        type: K
    } & IpcMessageDefinitions[K]
}

export type IpcMessage = IpcMessageMap[keyof IpcMessageMap]


export type WsMessage = any

export type RunnerWatchDog = {
    /** If no WS Connected within time, destroy the worker */
    wsTimeoutSecond: number
    timer?: NodeJS.Timeout
}
