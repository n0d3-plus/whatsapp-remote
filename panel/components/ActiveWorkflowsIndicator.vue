<template>
    <v-menu>
        <template v-slot:activator="{ props }">
            <v-chip v-bind="props" :color="activeWorkers.length ? 'success' : ''">
                {{ activeWorkers.length }} Workers
            </v-chip>
        </template>
        <v-list density="compact" class="pa-0 ma-0">
            <v-list-item v-for="item in activeWorkers" :key="item" :value="item" :title="item"
                @click="showDialog(item)" />
        </v-list>
    </v-menu>
    <v-dialog v-model="dialog" max-width="900" min-height="300" height="600" max-height="900" Xscrollable>
        <WorkerLogViewer :worker-name="selectedName" :log-url="logUrl" class="fill-height" />
    </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { activeWorkers } from '../uses/ws-runner-api';
import WorkerLogViewer from './WorkerLogViewer.vue';
import { useWsApi } from '../uses/ws-api';
const dialog = ref(false)
const selectedName = ref('')
const logUrl = ref('')
const { ws } = useWsApi()

function getLogUrl(name: string, kibToFetch: number = 50) {
    const bytesToFetch = kibToFetch * 1024;
    return `${ws.getRunnerUrl()}/worker-log/${encodeURIComponent(name)}/${bytesToFetch}`

}

function showDialog(name: string) {
    selectedName.value = name
    logUrl.value = getLogUrl(name)
    if (!dialog.value)
        nextTick(() => dialog.value = true)
}

</script>
