import type { ActionNodeData } from "@src/types/action-types";
import type { Execution, KernelProcess } from "@src/types/worker-types";
import { useVueFlow, type FlowExportObject } from "@vue-flow/core";
import { reactive, ref } from "vue";
import type { shallowReactive, Reactive, Ref, ShallowReactive } from "vue";

type MapValue<T> = T extends WeakMap<any, infer v> ? v : never
const states = new Map<number/* SessionID */, KernelDebugFlow>()

export type KernelDebugFlow = Reactive<WeakMap<
    ActionNodeData,
    NodeDebugFlow
>>

export type NodeDebugFlow = Map<
    number/* KernelProcess.id */,
    {
        exec: Execution,
        state: null | 'run' | 'ok' | 'err'
    }[]
>

export function useKernelDebugFlow(id: number, initial?: FlowExportObject) {
    if (states.has(id)) {
        return { value: states.get(id)!, stop: null }
    }

    const sessionId = id
    const newState: KernelDebugFlow = reactive(new WeakMap())

    states.set(sessionId, newState)
    if (initial && Array.isArray(initial.nodes)) {
        for (const n of initial.nodes) {
            newState.set(n.data, new Map())
        }
    }
    const { onNodesChange } = useVueFlow(sessionId.toString())
    const { off } = onNodesChange((changes) => {
        changes.filter(t => ['add', 'remove'].includes(t.type)).forEach(
            change => {
                if (change.type == 'add') {
                    if (newState.has(change.item.data)) {
                        console.log(`Add but exists`, change.item)
                        return
                    }
                    console.log(`Add `, change.item)
                    newState.set(change.item.data, new Map())
                } /* else if (change.type == 'remove') {
                    newState.delete(change.id)
                } */
            }
        )
    })

    return {
        value: newState,
        stop() {
            off()
            states.delete(sessionId)
        }
    }

}