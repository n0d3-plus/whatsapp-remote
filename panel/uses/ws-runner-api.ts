import { ref } from "vue";
import { useWsApi } from "./ws-api";

const { ws } = useWsApi()

export const activeWorkers = ref<string[]>([])

// On config DB update
ws.listen('active_workers', (v) => {
    activeWorkers.value = v
})

// export function useActiveWorker(workerName: string){

// }