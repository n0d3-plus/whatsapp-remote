<template>
    <!-- <component v-if="component" :is="component" v-bind="bindings" v-model="value" /> -->
    <component :config="config" :label="config?.label || name" v-model="value" />
</template>
<script setup lang="ts">
import { shallowRef, watch } from 'vue';
import type { ConfigItem } from '@action-types';
import { useConfigComponent } from './ConfigComponent';


const props = defineProps<{
    name: string,
    values: Record<string, any>//ConfigValues<ConfigItem>,
    config: ConfigItem
}>()

const value = shallowRef(props.values[props.name])
const component = useConfigComponent(props.config)

watch(value, (v) => {
    console.debug('update', v)
    props.values[props.name] = v
})

</script>