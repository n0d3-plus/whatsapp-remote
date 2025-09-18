import type { MSG_TYPE } from "../waweb/WAWebMsgType"

export enum VerifiedLevel { UNKNOWN, LOW, HIGH }

export type MsgType = Lowercase<keyof typeof MSG_TYPE>

export type SenderBase = {
    id: string
    isMe?: boolean
    isUser?: boolean
    isGroup?: boolean
}
export interface MsgPayloadSender extends SenderBase {
    name?: string
    isInContact?: boolean
    isBusiness?: boolean
    isEnterprise?: boolean
    verifiedLevel?: VerifiedLevel
    verifiedName?: string
}

export interface MsgPayload extends SenderBase {
    type: MSG_TYPE | Lowercase<keyof typeof MSG_TYPE>
    /** May be user, group or other */
    from: MsgPayloadSender
    /** If from group, this is the person */
    author?: MsgPayloadSender
    title: string
    body: string
}