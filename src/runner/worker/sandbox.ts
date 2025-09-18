import path from "node:path";
import { createContext, Script } from "node:vm";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { logger, store } from "./context";
import { actionUtilsConfig } from "../../workflow/action-utils";

import type { WorkerConfig, SandboxRunParam, SandboxRunResult } from "@worker-types";
import type { actionsMap } from "../../workflow/action-map";
import type { RemoteApiBridge } from "./remote-api-bridge";

actionUtilsConfig.store = store

let vmEntrypoint = fileURLToPath(import.meta.resolve('./vm/index'))
let needToTranspile = path.extname(vmEntrypoint) == '.ts'
if (!needToTranspile) {
    // add .js extension
    vmEntrypoint += '.js'
}
// production atau .js file
let vmCode: string = readFileSync(vmEntrypoint, 'utf8');
if (needToTranspile) {
    const swc = await import("@swc/core")
    const tp = await swc.transform(vmCode, {
        jsc: {
            parser: {
                syntax: "typescript"
            },
            target: "es2024",
        },
        isModule: true,
        module: {
            type: "es6",
        }
    })
    vmCode = tp.code
}
// remove export {} that added by swc for ESM
vmCode = vmCode.replace('export { };', '')

const vmScript = new Script(vmCode, { filename: 'VM' })
const vmSanbox = vmScript.runInContext(createContext({ console: logger })) as GeneratorFunction

export type Sandbox = Generator<Promise<SandboxRunResult>, undefined, SandboxRunParam | 'exit'>

export function createSandbox(workerName: string, config: WorkerConfig, actions: typeof actionsMap, remoteApi: RemoteApiBridge) {

    const vm: Sandbox = vmSanbox(workerName, config, actions, store, remoteApi) as any

    vm.next() // ignore first value

    return (param: SandboxRunParam | 'exit') => vm.next(param).value
}
