import { Worker } from "node:worker_threads";
import { WorkerController } from "./worker-controller";
import type { WorkerConfig } from "@worker-types";
import { fileURLToPath } from "node:url";


const workerEntrypoint = fileURLToPath(import.meta.resolve('../worker/index'))
console.debug('Starting worker..', workerEntrypoint)

// This in run in Runner's main thread
export async function startWorker(workerName: string, workerConfig?: WorkerConfig, logFile?: string, historyFilePath?: string, hideConsole?: boolean) {

    const worker = new Worker(workerEntrypoint, {
        workerData: { name: workerName, config: workerConfig, historyFilePath },
        env: process.env,
        execArgv: process.execArgv,
        stderr: hideConsole,
        stdout: hideConsole,
        stdin: false
    })

    await new Promise((r, j) => {
        const onError = (err) => {
            // console.warn('[RUNNER.WORKER] Failed:', err)
            j(err)
        }

        const onMsg = msg => {
            if (msg.ready) {
                worker.off('error', onError)
                worker.off('message', onMsg)
                return r(true)
            } else if (msg.error) {
                return j(msg.error)
            }
            console.debug('[RUNNER.WORKER]', msg)
        }
        worker.on('message', onMsg)
        worker.on('error', onError)
    })

    return new WorkerController(workerName, worker, logFile)
}