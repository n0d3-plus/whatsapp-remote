import type { SandboxRunParam } from "@worker-types";
import { AsyncLocalStorage } from "node:async_hooks";
import nodeConsole, { type Console } from "node:console";

export const store = new AsyncLocalStorage<SandboxRunParam>()


const prefix = () => {
    const ctx = store.getStore()
    return ctx ? `${ctx.pid}.${ctx.eid}.${ctx.nodeId}:` : '*.*.*:'
}

export const logger/* : Console */ = {
    FAKE_CONSOLE: true,
    // Console = null;
    // ...nodeConsole,
    debug(message?: unknown, ...optionalParams: unknown[]): void {
        nodeConsole.debug(prefix(), message, ...optionalParams)
    },
    error(message?: unknown, ...optionalParams: unknown[]): void {
        nodeConsole.error(prefix(), message, ...optionalParams)
    },
    info(message?: unknown, ...optionalParams: unknown[]): void {
        nodeConsole.info(prefix(), message, ...optionalParams)
    },
    log(message?: unknown, ...optionalParams: unknown[]): void {
        nodeConsole.log(prefix(), message, ...optionalParams)
    },
    warn(message?: unknown, ...optionalParams: unknown[]): void {
        nodeConsole.warn(prefix(), message, ...optionalParams)
    },
    trace(message?: unknown, ...optionalParams: unknown[]): void {
        nodeConsole.trace(prefix(), message, ...optionalParams)
    },

    // time(label?: unknown): void {
    //     throw new Error("Method not implemented.");
    // },
    // timeEnd(label?: unknown): void {
    //     throw new Error("Method not implemented.");
    // },
    // timeLog(label?: unknown, ...data: unknown[]): void {
    //     throw new Error("Method not implemented.");
    // },
    // timeStamp(label?: unknown): void {
    //     throw new Error("Method not implemented.");
    // },


}
