import type { WorkerConfig } from "@src/types/worker-types"
import { vueflowToWorkflowConfig } from "@src/utils/shared"
import { type FlowExportObject, type GraphEdge, type GraphNode, useVueFlow } from "@vue-flow/core"
import { shallowRef, watch, type WatchHandle } from "vue"

function exportData(
    nodes: GraphNode[], edges: GraphEdge[]
) {
    const obj = {
        nodes: [] as FlowExportObject['nodes'],
        edges: [] as FlowExportObject['edges']
    }

    for (const node of nodes) {
        const {
            computedPosition: _,
            handleBounds: __,
            selected: ___,
            dimensions: ____,
            isParent: _____,
            resizing: ______,
            dragging: _______,
            events: _________,
            ...rest
        } = node

        obj.nodes.push(rest)
    }

    for (const edge of edges) {
        const { selected: _, sourceNode: __, targetNode: ___, events: ____, ...rest } = edge
        obj.edges.push(rest)
    }
    return vueflowToWorkflowConfig(obj)
    // console.debug('UPDATED', obj)
    // updateConfigDebouncer(100)
}

export function useVueflowExtractor(id: string) {
    const { nodes, edges } = useVueFlow(id)
    let watchers: WatchHandle[] = [null!, null!, null!]
    let debouncer: any = 0
    const workerConfig = shallowRef<WorkerConfig>(null!/* { nodes: {}, chains: [] } */)

    const onDataUpdated = () => {
        workerConfig.value = exportData(nodes.value, edges.value)
    }

    watchers[0] = watch(() => nodes.value.length, () => {
        // console.debug('Nodes added/removed', nodes.value.length)
        if (watchers[2]) watchers[2]()

        onDataUpdated()
        // re-watch on every node added/removed
        watchers[2] = watch(
            nodes.value.map(n => n.data),
            () => {
                clearTimeout(debouncer)
                debouncer = setTimeout(onDataUpdated, 700)
            })
    }, { immediate: true })

    watchers[1] = watch(() => edges.value.length, onDataUpdated)

    return {
        config: workerConfig,
        stop: () => watchers.forEach(w => w && w())
    }
}