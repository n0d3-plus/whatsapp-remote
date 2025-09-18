import type { MapValue } from "@helper-types"
import type { Execution, NodeChain } from "@worker-types"

export class PendingExecution {
    waitingGroup: Map<string/* Input handle */, MapValue<NodeChain['prev']>[number]>[] = []
    resolveds = new WeakMap<NodeChain, any>()
    constructor(private chain: NodeChain) { }

    add(length: number) {
        this.waitingGroup.push(...Array.from(
            { length },
            (_, index) => {
                return new Map([...this.chain.prev].map(
                    ([handle, chains]) => {
                        // If index not equals, get the latest chain
                        return [handle, chains.length <= index ? chains.at(-1) : chains[index]]
                    }
                ))
            }))
    }

    get done() {
        return this.waitingGroup.length === 0
    }

    provide(chain: NodeChain, value: any) {
        this.resolveds.set(chain, value)
    }

    ready() {
        const ready: typeof this.waitingGroup = []

        this.waitingGroup = this.waitingGroup.filter(w => {
            // check if all previous nodes has been resolved
            if (w.size == [...w.values()].filter(v => this.resolveds.has(v[0])).length) {
                // is ready
                ready.push(w)
                return false
            }
            return true
        })

        if (ready.length == 0) return null

        return ready.map(v => {
            const chains: Execution['chains'] = []
            const consumesMap: Execution['consumesMap'] = new WeakMap()
            let mapVal: [string, string][]
            const consumes: Execution['consumes'] = Object.fromEntries([...v.entries()].map(
                ([handle, [nodeChain, sourceHandle, chainId]]) => {
                    chains.push(chainId)
                    mapVal = consumesMap.get(nodeChain)
                    if (!mapVal) {
                        mapVal = []
                        consumesMap.set(nodeChain, mapVal)
                    }

                    mapVal.push([sourceHandle, handle])
                    // handleMaps[handle] = chain
                    return [handle, this.resolveds.get(nodeChain)]
                }
            ))
            return {
                chains,
                consumes,
                consumesMap
            }
        })
    }

}