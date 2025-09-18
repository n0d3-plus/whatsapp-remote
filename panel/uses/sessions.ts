import { provide, ref, shallowRef, watchEffect, type InjectionKey, type Ref, type ShallowRef, type UnwrapRef } from "vue";
import { SessionState, WaStatesNull, type SessionConfig, type WaStates, type WsData } from "../../src/types";
import { useWsApi } from "./ws-api";
import { watch } from "vue";

interface SessionRefs {
    state: Ref<SessionState>
    waState: Ref<WaStates>
}

export type SessionItem = SessionConfig & SessionRefs

const { ws } = useWsApi()
const db = shallowRef<WsData['db']>({} as any)

const sessions = shallowRef<Map<number, SessionItem>>(null as any)

// On config DB update
ws.listen('db', (v) => {
    db.value = v
    sessions.value = new Map(v.configs.map(
        (c) => {
            const found = sessions.value?.get(c.id)
            const refs: SessionRefs = {
                state: found?.state || ref(SessionState.unknown),
                waState: found?.waState || ref(WaStatesNull())
            }
            return [c.id, Object.assign(c, refs)]
        }
    ))
})


const updateRefs = <T extends keyof SessionRefs>(
    key: T, [id, value]: [number, value: UnwrapRef<SessionRefs[T]>]
) => {
    if (!sessions.value.has(id)) return
    sessions.value.get(id)![key].value = value
}

ws.listen('session_states', (data) => {
    data.forEach(updateRefs.bind(null, 'state'))
})

ws.listen('wa_states', (data) => {
    data.forEach(updateRefs.bind(null, 'waState'))
})

export function useSessions() {
    return sessions
}

export async function waitSessions(): Promise<typeof sessions> {
    if (!sessions.value) {
        await new Promise(r => {
            const unwatch = watch(sessions, (v) => {
                if (v) {
                    r(sessions)
                    unwatch()
                }
            }, { immediate: true })
        })
    }
    return sessions
}

/** Provide current active session */
// export const sessionKey = Symbol() as InjectionKey<ShallowRef<SessionItem>>

export async function useSession(sessionId: number) {
    await waitSessions()
    const session = shallowRef<SessionItem>(sessions.value?.get(sessionId)!)
    const stop = watch(sessions, () => {
        session.value = sessions.value.get(sessionId)!
    })

    return { session, stop }
}