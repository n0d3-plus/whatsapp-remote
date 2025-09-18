<template>
    <VDialog v-model="dialog" max-width="600" @after-leave="onHide" scrollable>
        <template #activator="{ props }">
            <v-btn v-bind="{ ...$attrs, ...props }" variant="outlined" size="small" block @click="onShow">{{
                config.label || 'Edit Items'}} ({{
                    modelValue?.length }})</v-btn>
        </template>
        <VCard :title="`Edit ${label || config?.label}`" density="compact">
            <VCardItem v-if="items.length == 0">
                <VAlert type="info">No Items</VAlert>
            </VCardItem>
            <VCardText v-else>
                <div v-for="(item, i) of items" :key="i" class="d-flex py-2 align-center">
                    <component :is="item.editor" :config="item.config" :label="item.config.label"
                        v-model="item.value" />
                    <v-btn color="error" variant="text" density="compact" icon="close" @click="confirmDelete(i)"
                        class="ml-2" />
                </div>
            </VCardText>
            <VCardActions>
                <v-btn prepend-icon="add" @click="addItem(null)">Add Item</v-btn>
                <v-spacer />
                <v-btn @click="onok" prepend-icon="check" color="success">OK</v-btn>
            </VCardActions>
        </VCard>
    </VDialog>
</template>

<script setup lang="ts">
import type { ConfigItem, ConfigOption } from '@src/types/action-types';
import { ref, shallowRef, unref, type Ref, type RenderFunction } from 'vue';
import { useConfigComponent } from '../ConfigComponent';
import { nextTick } from 'vue';

defineOptions({ inheritAttrs: false })

const dialog = ref(false)
const { config, modelValue } = defineProps<{
    config: ConfigOption<"LIST">
    label?: string
    modelValue: any
}>()

const emits = defineEmits<{ (event: 'update:modelValue', items: any[]) }>()

// const itemConfig: ConfigItem = {
//     type: config.itemType as "TEXT",
// }
// const model = defineModel<any[]>({ default: [] })
const items = ref<{
    config: ConfigItem,
    value: Ref<any>,
    editor: Function
}[]>([])

function addItem(value?: any) {
    const count = items.value.length

    const modelValue = ref(value || null)
    const itemConfig: ConfigItem = {
        ...config.itemConfig,
        label: `${config.itemConfig.label || 'Item'} ${count + 1}`,
    }

    items.value.push({
        config: itemConfig,
        value: modelValue,
        editor: useConfigComponent(itemConfig)
    })
}

function onShow() {

    if (Array.isArray(modelValue)) {
        modelValue.forEach(v => addItem(v))
    }
}

function confirmDelete(i: number) {
    const item = items.value[i]
    if (!item) return
    if (!confirm(`Remove ${item.config.label}?`))
        return
    items.value.splice(i, 1)
}

function onok() {
    const values = items.value.map(v => unref(v.value))
    emits('update:modelValue', values)
    console.debug(values)
    dialog.value = false
}

function onHide() {
    //clear
    nextTick(() => {
        items.value.splice(0)
    })
}

</script>