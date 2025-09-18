<script setup lang="ts">
import { nextTick, onMounted, ref, shallowRef } from 'vue';

import { kernelProcessRestore } from '@src/runner/utils/log-trim';
import type { KernelProcess } from '@src/types/worker-types';
import { useWsApi } from '../../uses/ws-api';
import { formatTimestamp } from '../../libs/helper';
import KernelProcessDialog from '../../components/KernelProcessDialog.vue';
const { workerName } = defineProps<{ workerName: string, sessionId: number }>()
const canRealTime = ref(false)
const fetchSize = ref(5) // KiB
const fetching = ref(true)
const showAlert = ref<string | null>()
const runnerUrl = useWsApi().ws.getRunnerUrl()
const items = shallowRef<KernelProcess[]>([])

async function fetchLogs() {
    fetching.value = true
    showAlert.value = null
    const fetchItems: KernelProcess[] = []
    try {
        // Guess bytes to fetch (assuming ~150 bytes per line on average)
        const res = await fetch(`${runnerUrl}/worker-execution/${workerName}/${fetchSize.value * 1024}`)

        if (res.status !== 206 && res.status !== 200) {
            throw new Error('Empty execution history')
        }

        const text = await res.text();
        let json: KernelProcess

        text.split(/\r?\n/).reverse().forEach(line => {
            try {
                json = kernelProcessRestore(line)
                fetchItems.push(json)
            } catch (error) { } // ignore incomplete line
        })
    } catch (err) {
        showAlert.value = err?.['message'] || err
    }
    items.value = fetchItems
    setTimeout(() => fetching.value = false, 500)
}
function deleteFile() {
    if (!confirm(`Are you sure want to delete history file of ${workerName}?`))
        return
    fetching.value = true
    fetch(`${runnerUrl}/worker-execution/${workerName}`, { method: 'DELETE' })
        .then(async (res) => {
            if (res.status == 200) {
                items.value = []
                await nextTick()
                return fetchLogs()
            } else {
                fetching.value = false
            }
        })
}
const detailDialog = shallowRef<InstanceType<typeof KernelProcessDialog>>()
function showDialog(v: KernelProcess) {
    detailDialog.value.show(v)
}

onMounted(() => {
    fetchLogs()
})
</script>

<template>
    <VCard :loading="fetching" prepend-icon="account_tree" title="Workflow Executions" class="d-flex flex-column">
        <template #append>
            <div class="d-flex align-center ga-2">
                <!-- <span></span> -->
                <!-- <v-switch :disabled="!canRealTime" v-model="realtime" :color="realtime ? 'success' : 'default'" hide-details
                <VAlert v-if="showAlert" v-text="showAlert" />
                    label="Realtime" /> -->
                <!-- <VSpacer /> -->
                <!-- <v-btn :to="{ name: 'workflow', params: { id: sessionId } }" Xsize="small" density="comfortable"
                    prepend-icon="flowsheet" variant="elevated" color="primary">Workflow Editor</v-btn> -->
                <!-- <v-btn-group variant="outlined" density="compact" divided> -->
                <v-btn :loading="fetching" density="compact" @click="fetchLogs" variant="text" color="primary"
                    icon="refresh"></v-btn>
                <v-btn @click="deleteFile" class="ml-2" color="error" icon="delete_forever" variant="text"
                    density="compact"></v-btn>
            </div>
        </template>
        <VDivider />
        <VCardText v-if="showAlert">
            <VAlert v-text="showAlert" />
        </VCardText>
        <div class="pt-2" style="flex: 1 1 auto; overflow-y: auto; min-height: 0px;">
            <VListItem @click="showDialog(v)" density="compact" v-for="(v, i) in items" :key="i" :value="v.id">
                <div class="d-flex ga-2">
                    <VChip style="flex: 0 0 auto" tag="code" label size="small" density="comfortable">
                        {{ v.id }}
                    </VChip>
                    <div style="flex: 1 1 auto" class="text-truncate">{{ v.data?.msg?.from?.name ||
                        v.data?.msg?.from?.id }}
                        <VChip v-if="v.data?.msg?.isMe" style="flex: 0 0 auto" label size="small" color="primary"
                            density="comfortable" text="YOU" />
                    </div>
                    <small style="flex: 0 0 auto" class="text-disabled">
                        {{ formatTimestamp(v.ts) }}
                    </small>
                    <!-- <VSpacer>
                    </VSpacer> -->
                    <VChip style="flex: 0 0 auto" label size="small" :color="v.hasError ? 'warning' : 'success'"
                        :prepend-icon="v.hasError ? 'warning' : 'check_circle'" density="comfortable">
                        {{ v.hasError ? 'Fail' : 'OK' }}
                    </VChip>
                    <VChip style="flex: 0 0 auto" label size="small" density="comfortable"
                        :title="new Date(v.ts).toLocaleString()">
                        <code>{{ ((v.end - v.start) / 1000).toFixed(3) }}s</code>
                    </VChip>
                </div>
            </VListItem>
        </div>
    </VCard>
    <KernelProcessDialog ref="detailDialog" />
</template>
