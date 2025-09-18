import type { AsyncLocalStorage } from "node:async_hooks"
import type { ActionFunctionsMap, ActionOptionsMap } from "../../../types/action-types"
import type { RemoteApiBridge } from "../remote-api-bridge"
import type { SandboxError, SandboxRunParam, SandboxRunResult, WorkerConfig } from "../../../types/worker-types"
import type { logger } from "../context"

declare var console: typeof logger

/**
 * Sandboxed code run inside VM execute action code
 */
function* _vm_tick(workerName: string,
    config: WorkerConfig,
    actions: {
        functions: ActionFunctionsMap,
        options: ActionOptionsMap
    },
    store: AsyncLocalStorage<SandboxRunParam>,
    remoteApi: RemoteApiBridge
) {

    let result: Promise<SandboxRunResult> | null = null
    let msg: SandboxRunParam

    msg = yield
    for (; ;) {
        result = null

        if (typeof msg != 'object') {
            if (msg == 'exit') return result // End the generator
            result = Promise.resolve({ $ERR: 'InternalError', message: 'Empty msg param' })
        } else {
            result = new Promise((resolve) => store.run(msg, () => {
                try {
                    const msg = store.getStore()
                    if (!msg?.nodeId)
                        throw new Error('No NodeId defined')

                    if (!config.nodes)
                        throw new Error('No nodes defined')

                    const node = config.nodes[msg.nodeId]
                    if (!node)
                        throw new Error('NodeId not found')

                    const action = actions.functions.get(node.actionId)

                    if (!action) {
                        console.log('Available action', [...actions.functions.keys()])
                        throw new Error('Action id not found: ' + node.actionId)
                    }

                    resolve(action(node.config, msg.consumes, store, console, remoteApi).catch(error => {
                        console.error(error)
                        return {
                            $ERR: error.name || error,
                            message: error.message,
                            stack: error.stack,
                        } as SandboxError
                    }))

                } catch (error) {
                    console.warn(error)
                    resolve({
                        $ERR: error.name || error,
                        message: error.message,
                        stack: error.stack,
                    })
                }

            }))
        }

        msg = yield result
    }
}

// Hide parent stack
Error['prepareStackTrace'] = (err: Error) => {
    const pos = err.stack?.lastIndexOf('at _vm_tick.next ')
    if (pos) {
        // return err.stack.slice(0, pos).replace(/at _vm_tick \(.+?:/, 'at VM (vmCode:')
        return err.stack?.slice(0, pos).trimEnd()
    }
    // Hide all stack
    return `${err.name}: ${err.message}`
}

_vm_tick
