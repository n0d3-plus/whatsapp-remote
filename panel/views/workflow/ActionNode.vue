<script lang="ts">
const unknownAction: ActionOptions<ConfigOptions, DataOptions, DataOptions> = {
    name: 'Unknown Action',
    type: 'custom',
    configs: {},
    consumes: {},
    produces: {},
    id: 'unknown'
}
const runStateColor = {
    'err': 'text-error',
    'ok': 'text-success',
}
</script>
<script setup lang="ts">
import { Handle, Position, useVueFlow, type Connection, type GraphNode } from '@vue-flow/core'
import { nextTick, ref, shallowRef, watchEffect } from 'vue';
import { watch } from 'vue';
import { Storage } from '../../uses/storage';
import type { NodeDebugFlow } from './debug/KernelDebugFlow';
import type { Execution } from '@src/types/worker-types';
import type { ActionNodeData, ActionOptions, ConfigOptions, DataOptions } from '@src/types/action-types';
import { populateHandles, type HandleDef } from './FlowUtil';
import { NodeActionTypeMap } from '../../libs/label-icon-color';
import ConfigEditor from './node/ConfigEditor.vue';

const { updateNodeInternals, nodes } = useVueFlow()
const props = defineProps<{
    id: string, data: ActionNodeData, flow: NodeDebugFlow
}>()
const { id, data, flow: debugFlow } = props
const currentAction = Storage.actions.get(data.id) || unknownAction
const action = shallowRef(currentAction!)
const canConsume = action.value.type != 'emitter'
const isProcessing = ref(false)
const updateProcessingState = () => {
    for (const [k, vv] of debugFlow) {
        for (const v of vv) {
            if (v.state == 'run') {
                isProcessing.value = true
                return
            }
        }
    }
    isProcessing.value = false
}
let updateProcessTimer: any = undefined
watch(debugFlow, (flow) => {
    clearTimeout(updateProcessTimer)
    updateProcessTimer = setTimeout(updateProcessingState, isProcessing.value ? 500 : 100)
}, { deep: true })

const consumeHandles = shallowRef<HandleDef[]>(
    (canConsume && data.consumes) ? populateHandles([], data.consumes) : []
)
const produceHandles = shallowRef<HandleDef[]>(data.produces ? populateHandles([], data.produces) : [])
const isDynamicParams = [action.value.produces, action.value.consumes].some(v => typeof v === 'function')

if (isDynamicParams) {

    watchEffect(() => {
        if (canConsume && typeof action.value.produces == 'function') {
            data.produces = action.value.produces(data.config)
            produceHandles.value = populateHandles(produceHandles.value, props.data.produces)
        }
        if (typeof action.value.consumes == 'function') {
            data.consumes = action.value.consumes(data.config)
            consumeHandles.value = populateHandles(consumeHandles.value, props.data.consumes)
        }
        nextTick(() => updateNodeInternals([id]))
    })
}

function isValidTarget(connection: Connection) {

    if (connection.target == connection.source) return false

    const targetNode: GraphNode<ActionNodeData> | undefined = nodes.value.find(v => v.id == connection.target)

    const targetType = targetNode?.data.consumes[connection.targetHandle as string]?.type
    const sourceType = data?.produces?.[connection.sourceHandle as string]?.type
    // console.debug(`Check ${sourceType} fit on ${targetType}`)
    return targetType == 'ANY' || sourceType == 'ANY' || targetType === sourceType
}
const icon = NodeActionTypeMap[action.value.type][1]

defineEmits<{ (e: 'showExec', p: Execution) }>()

</script>

<template>
    <div class="flow-stats">
        <template v-for="[pid, execs] of flow">
            <span class="flow-item" v-for="(v, i) of execs" :class="v.state ? runStateColor[v.state] : ''"
                :key="v.exec.id" @click.stop="$emit('showExec', v.exec)">
                <b>{{ pid }}</b><sup v-if="execs.length > 1" class="text-disabled">{{ i + 1 }}</sup>
            </span>

        </template>
    </div>
    <VCard :loading="isProcessing" :title="data.label" :subtitle="`ID:${id}`" :border="true" :prepend-icon="icon"
        density="compact" :color="action == unknownAction ? 'error' : ''">
        <div class="action-run-effect" v-show="isProcessing"></div>
        <VCardText class="pt-0">
            <p style="max-width: 200px; text-align: justify;" class="text-disabled pt-0">{{ action.desc }}</p>
            <ConfigEditor v-for="(config, name) of action.configs" :key="name" :config="config" :name="name"
                :values="data.config" />
            <!-- <NodeConfig :options="action.configs" :values="data.config" /> -->
        </VCardText>
    </VCard>
    <Handle v-for="item of consumeHandles" v-bind="item" :key="item.id" type="target" :position="Position.Left" />

    <Handle v-for="item of produceHandles" v-bind="item" :key="id" type="source" :position="Position.Right"
        :is-valid-connection="isValidTarget" />
</template>
