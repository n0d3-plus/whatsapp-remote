<template>
    <VList density="compact" v-model:selected="selected" color="primary">
        <VListItem v-for="(id, i) in [...inProgress.values()].reverse()" :key="id">
            <div class="d-flex ga-2">
                <VChip tag="code" label size="small" density="comfortable">
                    {{ id }}
                </VChip>
                <v-icon class="spin" color="warning">restart_alt</v-icon>
                <div class="text-truncate text-disabled">Executing..</div>
                <VSpacer />
                <VChip label size="small" density="comfortable">
                    <code>.....s</code>
                </VChip>
            </div>
        </VListItem>

        <VListItem density="compact" v-for="(v, i) in items" :key="v.id" :value="v.id">
            <div class="d-flex ga-2">
                <VChip tag="code" label size="small" density="comfortable">
                    {{ v.id }}
                </VChip>
                <div class="text-truncate">{{ new Date(v.ts).toLocaleString() }}</div>
                <VSpacer />
                <VChip label size="small" :color="v.hasError ? 'warning' : 'success'"
                    :prepend-icon="v.hasError ? 'warning' : 'check_circle'" density="comfortable">
                    {{ v.hasError ? 'Fail' : 'OK' }}
                </VChip>
                <VChip label size="small" density="comfortable">
                    <code>{{ ((v.end - v.start) / 1000).toFixed(3) }}s</code>
                </VChip>
            </div>
        </VListItem>
    </VList>
</template>
<script setup lang="ts">
import type { KernelProcess } from '@src/types/worker-types';
import { ref, shallowRef, watchEffect } from 'vue';
const items = shallowRef<KernelProcess[]>([])

const inProgress = ref(new Set<KernelProcess['id']>())
const selected = ref(null)
const model = defineModel<number>()
watchEffect(() => {
    model.value = selected.value?.[0]
})

const add = (item: KernelProcess) => {
    items.value.unshift(item)
}

defineExpose({
    add,
    inProgress,
    get: (pid: number) => items.value.find(v => v.id === pid),
    all: () => items.value,
    clear: () => items.value.splice(0)
})

</script>
<style>
.v-icon.spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(-360deg);
    }
}
</style>