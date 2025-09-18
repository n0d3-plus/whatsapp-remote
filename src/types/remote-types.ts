import type { FunctionKeys } from "@helper-types"
import type { RemoteApi } from "@remote/remote-api"

type RemoteApiFunctions = FunctionKeys<RemoteApi>

type WsRemoteApiInvokeMap = {
    [K in RemoteApiFunctions]: [number/* JobID */, K, Parameters<RemoteApi[K]>]
}
type WsRemoteApiReturnMap = {
    [K in RemoteApiFunctions]: [number/* JobID */, Awaited<ReturnType<RemoteApi[K]>> | null, any /* Error */]
}
export type WsRemoteApiReq = WsRemoteApiInvokeMap[RemoteApiFunctions]
export type WsRemoteApiRet = WsRemoteApiReturnMap[RemoteApiFunctions]

