import { parentPort, workerData } from "node:worker_threads";
import { actionsMap } from "../../workflow/action-map";
import { Kernel } from "./kernel";
import { createSandbox } from "./sandbox";
import { mergeConfig } from "./utils";
import { createWriteStream, truncate, type WriteStream } from "node:fs";
import { logRotator } from "../utils/log-rotator";
import { RemoteApiBridge } from "./remote-api-bridge";
import type { WorkerMessage, WorkerConfig } from "@worker-types";
import type { WsRemoteApiRet } from "@remote-types";
import { kernelProcessTrim } from "../utils/log-trim";
import { promisify } from "node:util";

// This code run in separate Runner's thread

const workerConfig: WorkerConfig = Object.create(null)
// Set config for the first time
if (workerData.config) {
    mergeConfig(workerData.config, workerConfig)
}
// Kernel is optional
let kernel: Kernel, kernelEnabled = false
let remoteApiBridge = new RemoteApiBridge()

let historyFs: WriteStream | null = null
let historyFilePath: string | null = null

async function clearHistory() {

    if (!historyFs || !historyFilePath) return false

    await new Promise<boolean>((resolve, reject) => {
        // Finish any pending writes
        const truncateAsync = promisify(truncate)
        historyFs.end(async () => {
            try {
                // Truncate file to 0 bytes
                await truncateAsync(historyFilePath, 0);
                // Reopen new WriteStream (flag "w" ensures truncation)
                historyFs = createWriteStream(historyFilePath, { flags: "w" });
                resolve(true);
                console.debug(`[${workerData.name}] History file cleared`)
            } catch (err) {
                console.warn(`[${workerData.name}] History clear failed: ${err.message}`)
                reject(err);
            }
        })
        historyFs.on("error", reject);
    })
}

async function activateKernel() {
    kernel = new Kernel(
        workerConfig,
        actionsMap.options,
        sandbox
    )
    historyFilePath = workerData.historyFilePath ?? null
    if (historyFilePath) {
        await logRotator(historyFilePath)
        historyFs = createWriteStream(historyFilePath, { flags: 'a' })
        // listen for events
        kernel.on('end', (p) => {
            try {
                historyFs.write(kernelProcessTrim(p))
            } catch (error) {
                console.warn(error)
            }
        })
    }
}

const sandbox = await createSandbox(workerData.name, workerConfig, actionsMap, remoteApiBridge)
parentPort.once('close', () => {
    console.debug(`-----  EXIT EVENT`)
})
console.debug(`----- START: ${workerData.name} initialConfig, nodes: ${workerConfig.nodes ? Object.keys(workerConfig.nodes) : '#null'}`)

parentPort.on('message', async (msg: WorkerMessage['request'] | WsRemoteApiRet) => {

    if (Array.isArray(msg)) {
        remoteApiBridge.handleResponse(msg)
        return
    }

    let reply: WorkerMessage['response'] = { jobId: msg.jobId, result: null }

    switch (msg.cmd) {
        case 'run':
            reply.result = await sandbox(msg.param)
            break

        case 'kernel':
            if (msg.param && !kernel) {
                await activateKernel()
            }// do we need to deactive kernel?

            reply.result = null
            break

        case 'clearHistory':
            reply.result = await clearHistory().catch(() => false)
            break

        case 'push':
            kernel.startWorkflow(msg.param)
            return // No response for incoming event

        case 'patchConfig':
            mergeConfig(msg.param, workerConfig)
            reply.result = null
            break

        case 'replaceConfig':
            // Clear old properties
            for (const key in workerConfig) {
                delete workerConfig[key]
            }
            mergeConfig(msg.param, workerConfig)
            reply.result = null
            console.debug(`[${workerData.name}] replaceConfig, nodes: ${Object.keys(workerConfig.nodes)}`)
            break

        case 'exit':
            remoteApiBridge.destroy()
            await sandbox('exit')
            if (historyFs) {
                try {
                    historyFs.close()
                } catch (e) { }
            }
            // return the reply before its closed
            parentPort.postMessage({ jobId: msg.jobId })
            parentPort.removeAllListeners()
            parentPort.close()
            return // Exit, parent port was closed
    }

    parentPort.postMessage(reply)

})

// ready
parentPort.postMessage({ ready: true })

