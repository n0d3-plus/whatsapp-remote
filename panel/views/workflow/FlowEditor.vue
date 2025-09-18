<script lang="ts">
import "./FlowEditor.css"
import ActionNode from './ActionNode.vue'
import type { Node, FlowExportObject, Edge } from '@vue-flow/core'
import { useSessions, type SessionItem } from '../../uses/sessions';
import { onMounted, onUnmounted, ref, shallowRef, toRef } from 'vue';
import type { ActionOptionItem, DataOptions } from '@action-types';
import { computed, watch } from 'vue'
import { Background } from '@vue-flow/background'
import useDragAndDrop from './DragAndDrop';
import { useTheme } from 'vuetify';
import { vueflowToWorkflowConfig } from '@shared-utils';
import DebugPanel from './debug/DebugPanel.vue'
import { useKernelDebugFlow } from './debug/KernelDebugFlow'
import type { Execution } from '@src/types/worker-types'
import ExecutionDetail from '../../components/ExecutionDialog.vue'
import type { ActionNodeData } from '@src/types/action-types'
</script>

<script setup lang="ts">
import { ConnectionMode, useVueFlow, VueFlow, Panel } from '@vue-flow/core'

/*
n8n sample implementation:
https://github.com/n8n-io/n8n/blob/master/packages/frontend/editor-ui/src/components/canvas/Canvas.vue
*/

const props = withDefaults(
    defineProps<{
        session: SessionItem,
        flow: FlowExportObject
    }>(),
    {
        flow: {} as any,
    })
const { current: themeCurrent } = useTheme()
const { onDragOver, onDragLeave, isDragOver, draggedAction } = useDragAndDrop()
const { onConnect, addEdges, addNodes, updateNode,
    screenToFlowCoordinate, onNodesInitialized,
    toObject, fromObject, nodes, edges, viewport, $destroy,
    fitView, nodesDraggable,
    nodesConnectable,
    elementsSelectable, setInteractive,
} = useVueFlow(props.session.id.toString())

const debugFlow = useKernelDebugFlow(props.session.id, props.flow)
// const sessions = useSessions()
onUnmounted(() => {
    $destroy()
    debugFlow.stop && debugFlow.stop()
})

function newId(actionId: string, label: string) {
    let usedCount = nodes.value.filter(v => v.data.id === actionId).length
    let newId = usedCount > 1 ? `${actionId}${usedCount}` : actionId
    let newLabel = label
    // The id maybe used if the nodes have ben removed/created
    while (nodes.value.findIndex(v => v.id == newId) >= 0) {
        newId = `${actionId}${++usedCount}`
        newLabel = `${label} ${usedCount}`
    }
    return { newId, newLabel }
}

onConnect((connection) => {
    // console.debug('OC', connection)
    addEdges(connection)
})

const dark = computed<boolean>(() => themeCurrent.value?.dark)

fromObject(props.flow)

function createNode(action: ActionOptionItem, x?: number, y?: number) {
    const { newId: nodeId, newLabel } = newId(action.id, action.name)
    const config = JSON.parse(JSON.stringify(action.configsDefault))
    const consumes = typeof action.consumes == 'function' ? action.consumes(config) : action.consumes as DataOptions
    const produces = typeof action.consumes == 'function' ? action.consumes(config) : action.produces as DataOptions
    if (typeof x == 'undefined' || typeof y == 'undefined') {
        x = window.innerWidth / 2
        y = window.innerHeight / 2
    }
    const position = screenToFlowCoordinate({ x, y })
    const newNode: Node<ActionNodeData> = {
        id: nodeId,
        type: 'action',
        position,
        data: {
            id: action.id,
            label: newLabel,
            consumes,
            produces,
            config
        },
    }
    const { off } = onNodesInitialized(() => {
        updateNode(nodeId, (node) => ({
            position: {
                x: node.position.x - node.dimensions.width / 2,
                y: node.position.y - node.dimensions.height / 2
            },
        }))
        off()
    })
    addNodes(newNode)
}

function onDrop(event: DragEvent) {
    if (!draggedAction.value) {
        console.warn('Drop without item')
        return
    }
    createNode(draggedAction.value, event.clientX, event.clientY)
}
const isInteractive = toRef(() => nodesDraggable.value || nodesConnectable.value || elementsSelectable.value)
function doSave() {
    emit('save', toObject())
}

defineExpose({ createNode })
const emit = defineEmits<{
    save: [FlowExportObject],
    add: []
}>()
const isDev = import.meta.env.MODE == 'development'
function onDebugObject() {
    console.debug('MODE', import.meta.env.MODE)
    const vueflowData = toObject()
    console.log(vueflowData)
    // const session = sessions.value.get(props.session.id)!
    const workflowData = vueflowToWorkflowConfig(vueflowData)
    console.log(workflowData)
}

watch([nodes, edges], () => {
    console.log('CHANGES')
})

/* DEBUG PANEL */
const vueflowRef = shallowRef<InstanceType<typeof VueFlow>>()
const debugPanel = ref((localStorage.getItem('showTester') ?? 'true') === 'true')

const debugPanelRef = shallowRef<InstanceType<typeof Panel>>()
const debugPanelVisible = ref(debugPanel.value)
const debugPanelHeight = ref(parseInt(localStorage.getItem('drawer-debug-height') || '0xff', 16) || 200)
const debugPanelResizing = ref(false)

const debugPanelUpdate = () => {
    const el: HTMLDivElement = debugPanelRef.value?.$el
    if (!el) return console.warn('debugPanelRef not ready')
    localStorage.setItem('showTester', `${debugPanel.value}`)
    if (debugPanel.value) {
        debugPanelVisible.value = true
        el.style.height = `${debugPanelHeight.value}px`
    } else {
        el.style.height = '0px'
    }
}

if (debugPanel.value) {
    onMounted(() => debugPanelUpdate())
}
watch(debugPanel, debugPanelUpdate)

function debugPanelTransitionEnd(event) {
    // Only trigger if the height transition finished
    if (event.propertyName === 'height') {
        debugPanelVisible.value = debugPanel.value
    }
}

const startResize = (e) => {
    debugPanelResizing.value = true
    document.body.style.cursor = 'row-resize'
    let el: HTMLDivElement = (vueflowRef.value?.$el as HTMLDivElement).querySelector('.vue-flow__pane')!
    el.style.cursor = 'row-resize'

    el = debugPanelRef.value?.$el
    if (!el) return console.warn('debugPanelRef not ready')
    el.style.transition = 'inherit'

    document.body.addEventListener('mousemove', onMouseMove)
    document.body.addEventListener('mouseup', stopResize)
    debugPanelHeight.value = Math.min(document.body.clientHeight - 100, Math.max(100, document.body.clientHeight - e.clientY))
}

const onMouseMove = (e: MouseEvent) => {
    if (!debugPanelResizing.value) return
    debugPanelHeight.value = Math.min(document.body.clientHeight - 100, Math.max(100, document.body.clientHeight - e.clientY))
    const el: HTMLDivElement = debugPanelRef.value?.$el
    el.style.height = `${debugPanelHeight.value}px`
}

const stopResize = (e) => {
    if (!debugPanelResizing.value) return
    debugPanelResizing.value = false
    document.body.style.cursor = 'default'
    let el: HTMLDivElement = (vueflowRef.value?.$el as HTMLDivElement).querySelector('.vue-flow__pane')!
    el.style.cursor = ''
    el = debugPanelRef.value?.$el
    if (!el) return console.warn('debugPanelRef not ready')
    el.style.transition = ''
    document.body.removeEventListener('mousemove', onMouseMove)
    document.body.removeEventListener('mouseup', stopResize)
    localStorage.setItem('drawer-debug-height', debugPanelHeight.value.toString(16))
}
const executionDetail = shallowRef<InstanceType<typeof ExecutionDetail>>()
function onShowExec(e: Execution) {
    executionDetail.value?.show(e)
}

</script>

<template>
    <ExecutionDetail ref="executionDetail" />
    <VueFlow ref="vueflowRef" :class="{ dark: dark }" snap-to-grid :snap-grid="[20, 20]"
        :connection-mode="ConnectionMode.Strict" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">

        <template #node-action="props">
            <ActionNode @show-exec="onShowExec" :id="props.id" :data="props.data"
                :flow="debugFlow.value.get(props.data)!" />
        </template>

        <Background variant="dots" :gap="20" :size="1" :color="'#666666'" />
        <div v-if="isDragOver" class="dnd-overlay">
            <p>Drop here</p>
        </div>
        <Panel position="top-center" style="text-wrap: nowrap;">
            <VBtnGroup density="comfortable" rounded divided class="mr-4" :border="true">
                <VBtn prepend-icon="add_2" class="text-success" @click="$emit('add')">
                    Add
                </VBtn>
                <VBtn prepend-icon="autoplay" :color="debugPanel ? 'success' : 'default'" title="Debug Mode"
                    @click="debugPanel = !debugPanel">
                    Tester
                </VBtn>
                <VBtn prepend-icon="save" title="Save" @click="doSave">Save</VBtn>
            </VBtnGroup>
            <VBtnGroup density="comfortable" rounded divided :border="true">
                <VBtn :icon="isInteractive ? 'lock_open_right' : 'lock'" title="Lock unlock edit"
                    @click="setInteractive(!isInteractive)" />
                <VBtn icon="fullscreen" title="Fit view" @click="fitView({ maxZoom: 1 })" />
                <VBtn v-show="isDev" icon="terminal" title="Log object" @click="onDebugObject" />
            </VBtnGroup>
        </Panel>
        <!-- Debug Panel -->
        <Panel position="bottom-center" ref="debugPanelRef" class="debug-panel"
            @transitionend="debugPanelTransitionEnd">
            <template v-if="debugPanelVisible">
                <div class="resize-handle" @mousedown.stop.prevent="startResize"></div>
                <DebugPanel v-if="session" :session="session" />
            </template>

        </Panel>
    </VueFlow>
</template>

<style>
/* .whatsapp-stats {
  position: absolute;
  right: 0px;
} */
</style>