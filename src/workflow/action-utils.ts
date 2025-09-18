import type { SandboxRunParam } from "@worker-types";
import type { AsyncLocalStorage } from "node:async_hooks";

export const actionUtilsConfig: {
    store: AsyncLocalStorage<SandboxRunParam>
} = {
    store: null
}

export class Break extends Error {
    constructor(message?: string) {
        super(message); // Call the parent Error constructor
        this.name = "Break";
        if (actionUtilsConfig.store) {
            this.stack = `Break: ${message}\n    at <Node>: ${actionUtilsConfig.store.getStore()?.nodeId}`
        }
    }
}