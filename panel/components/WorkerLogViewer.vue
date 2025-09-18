<template>
    <v-card class="d-flex flex-column" density="compact">
        <template #title>
            <div class="d-flex">
                <div>
                    Logs: {{ workerName }}
                </div>
                <v-spacer></v-spacer>
                <!-- <v-text-field v-model.number="lastSize" hide-details variant="solo" density="compact" label="Last N KiB"
                    type="number" style="max-width: 150px" @change="refresh"></v-text-field> -->
                <v-btn @click="refresh" color="primary" icon="refresh" variant="text" density="compact"></v-btn>
                <v-btn @click="clear" color="warning" icon="delete_sweep" variant="text" density="compact"></v-btn>
                <v-btn @click="deleteFile" class="ml-2" color="error" icon="delete_forever" variant="text"
                    density="compact"></v-btn>
            </div>
        </template>
        <v-divider />
        <div ref="dWrapper" class="fill-height" style="overflow: auto; flex: 1 1 0">
            <v-virtual-scroll ref="vscroll" class="log-view text-primary" :items="logLines" height="100%"
                :item-height="24">
                <template v-slot:default="{ item }">
                    <pre :title="item[0].toLocaleString()"
                        :class="`log-${item[1]}`"><span>{{ item[0].toLocaleTimeString() }}</span>{{ item[2] }}</pre>
                </template>
            </v-virtual-scroll>
        </div>
        <!-- <template #actions>
            XX
        </template> -->
    </v-card>
</template>
<style lang="css">
.log-view {
    /* background: #00000034; */
    background-color: rgb(var(--v-theme-surface));
}

.log-view .v-virtual-scroll__container {
    font-size: 12px;
    font-family: monospace;
    padding-left: 10px;
    /* padding: 10px; */
    /* overflow-y: auto; */
}

.log-view .v-virtual-scroll__item>pre.log-ERR {
    color: rgb(199, 29, 29)
}

.log-view .v-virtual-scroll__item>pre {
    height: 18px;
}

.log-view .v-virtual-scroll__item>pre>span {
    color: rgb(100, 100, 100);
    margin-right: 10px;
}
</style>
<script setup lang="ts">
import { nextTick, ref, shallowRef, watchEffect } from 'vue';
import type { VVirtualScroll } from 'vuetify/components';
import { useWsApi } from '../uses/ws-api';

const props = defineProps<{ workerName?: string, showEmptyLog?: boolean }>()
const logLines = ref<[Date, string, string][]>([])
const dWrapper = shallowRef<HTMLDivElement>()
const vscroll = shallowRef<VVirtualScroll>()
const runnerUrl = useWsApi().ws.getRunnerUrl()

defineEmits<{ (event: 'emptyLog') }>()

let timer: any
let scrollLast = (ts = 10) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
        nextTick(() => {
            const el: HTMLDivElement = vscroll.value?.$el
            if (!el) return
            // console.log(el.scrollHeight)
            el.scrollTop = el.scrollHeight + 18
        })
    }, ts)
}

// const tm = setInterval(() => {
//     logLines.value.push(["1754884817110", "OUT", (new Date().toLocaleString())])
//     scrollLast()
// }, 5000)

const startLog = "1754884817110 OUT ".length

const transformLine = (line: string) => [
    ...line.split(' ', 2).map((v, i) => i ? v : new Date(parseInt(v))), line.slice(startLog)
] as [Date, string, string]
const isValidLine = (line: string) => [" OUT ", " ERR "].includes(line.slice(13, 18))

defineExpose({
    add(line: string) {
        if (isValidLine(line)) {
            logLines.value.push(transformLine(line))
            nextTick(() => scrollLast(100))
        } else {
            console.warn('Invalid console line:', line)
        }
    },
    clear
})

function clear() {
    logLines.value = []//.splice(0)
    nextTick(scrollLast)
}

function refresh() {
    fetchLogs()
}

function deleteFile() {
    if (!confirm(`Are you sure want to delete log file of ${props.workerName}?`))
        return

    fetch(`${runnerUrl}/worker-log/${props.workerName}`, { method: 'DELETE' })
        .then((res) => {
            if (res.status == 200)
                clear()
        })
}

async function fetchLogs() {
    try {
        const res = await fetch(`${runnerUrl}/worker-log/${props.workerName}`)

        if (res.status !== 206 && res.status !== 200) {
            if (res.status == 204 || res.status == 404) {
                logLines.value = [[new Date(), 'OUT', `#Empty log`]];
            } else {
                logLines.value = [[new Date(), 'ERR', `Failed: ${res.status} ${await res.text()}`]];
            }
            return
        }

        const text = await res.text();
        // 1754884817110 OUT 
        const lines = text.split(/\r?\n/)
        // Remove first line if not valid output
        if (!isValidLine(lines[0])) {
            lines.shift()
        }
        logLines.value = lines.filter(Boolean).map(transformLine);
        nextTick(scrollLast)
    } catch (err) {
        logLines.value = [[new Date(), 'ERR', `Failed: ${err?.['message'] || err}`]];
    }
}

watchEffect(() => {
    fetchLogs()
})

</script>