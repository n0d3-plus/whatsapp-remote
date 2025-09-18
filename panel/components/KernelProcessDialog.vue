<template>
    <v-dialog v-model="dialog" max-width="900" scrollable>
        <v-card density="compact">
            <v-card-title class="d-flex justify-space-between align-center">
                Execution Flows
                <v-btn icon="close" density="compact" variant="text" @click="dialog = false" />
            </v-card-title>

            <v-divider />
            <v-card-item>
                <v-row no-gutters class="mb-1">
                    <v-col sm="3" md="2" cols="12" class="text-grey text-subtitle-2">ID</v-col>
                    <v-col sm="9" md="10" cols="12"><code>{{ detail.id }}</code></v-col>
                </v-row>
                <v-row no-gutters class="mb-1">
                    <v-col sm="3" md="2" cols="12" class="text-grey text-subtitle-2">Started</v-col>
                    <v-col sm="9" md="10" cols="12">{{ formatTimestamp(detail.ts) }}</v-col>
                </v-row>
                <v-row no-gutters class="mb-1">
                    <v-col sm="3" md="2" cols="12" class="text-grey text-subtitle-2">Elapsed</v-col>
                    <v-col sm="9" md="10" cols="12"><code>{{
                        detail.end ? `${((detail.end - detail.start) / 1000).toFixed(3)}s` : 'Not Finished'
                    }}</code></v-col>
                </v-row>
            </v-card-item>
            <v-card-text v-if="detail" class="pa-0">
                <VList>
                    <VListItem v-for="v of detail.executions" :key="v.id" @click="showDetail(v)">
                        <div class="d-flex ga-2">
                            <VChip tag="code" label size="small" density="comfortable">
                                {{ v.id }}
                            </VChip>
                            <div style="flex: 1 1 auto;" class="text-truncate">{{ v.node.id }}</div>
                            <VChip label size="small" :color="v.error ? 'warning' : 'success'"
                                :prepend-icon="v.error ? 'warning' : 'check_circle'" density="comfortable">
                                {{ v.error ? 'Fail' : 'OK' }}
                            </VChip>
                            <VChip label size="small" density="comfortable">
                                <code>{{ ((v.end - v.start) / 1000).toFixed(3) }}s</code>
                            </VChip>
                        </div>
                    </VListItem>
                </VList>
            </v-card-text>
        </v-card>
    </v-dialog>
    <ExecutionDialog ref="executionDialog" />
</template>
<script setup lang="ts">
import type { Execution, KernelProcess } from '@src/types/worker-types';
import { ref, shallowRef } from 'vue';
import { formatTimestamp } from '../libs/helper';
import ExecutionDialog from './ExecutionDialog.vue';

// State
const dialog = ref(false)
const detail = ref<KernelProcess | null>(null)
const executionDialog = shallowRef<InstanceType<typeof ExecutionDialog>>(null)

function showDetail(v: Execution) {
    executionDialog.value.show(v)
}

// Show function for parent
function show(data: KernelProcess) {
    detail.value = data
    dialog.value = true
}

// Expose show() for parent
defineExpose({ show })
</script>