<script setup lang="ts">
import useDragAndDrop from './DragAndDrop';
import { Storage } from '../../uses/storage';
import type { ActionOptionItem } from '@src/types/action-types';
import { NodeActionTypeMap } from '../../libs/label-icon-color';

const { onDragStart } = useDragAndDrop()
const actions = Storage.actions

const emits = defineEmits<{
    (event: 'itemClick', item: ActionOptionItem): void
    (event: 'dragStart', item: ActionOptionItem): void
}>()

function doDragStart($event: any, action: ActionOptionItem) {
    onDragStart($event, action)
    emits('dragStart', action)
}

</script>

<template>
    <VCard>
        <v-toolbar flat density="compact">
            <VBtn icon="add" />
            <v-toolbar-title>Add Nodes</v-toolbar-title>
        </v-toolbar>
        <VList>
            <VListItem :ripple="false" v-for="[id, action] in actions" :key="id" :title="action.name"
                :subtitle="action.desc" @click="$emit('itemClick', action)" :draggable="true"
                @dragstart="doDragStart($event, action)">
                <template #prepend>
                    <VIcon>{{ NodeActionTypeMap[action.type][1] }}</VIcon>
                </template>
                <template #append>
                    <VBtn style="cursor: grab" variant="text" density="comfortable" class="text-disabled"
                        icon="drag_indicator" />
                </template>
            </VListItem>
        </VList>
    </VCard>
</template>
