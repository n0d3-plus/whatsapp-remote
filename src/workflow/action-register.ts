import type {
    DataOptions, ConfigOptions, ConfigValues,
    ActionFunction, ActionOptions,
    ConfigType
} from "../types/action-types";
import { slugify } from "../utils/shared";
import type { actionsMap } from "./action-map";

export function registerAction<
    C extends ConfigOptions,
    I extends DataOptions,
    O extends DataOptions
>(info: Omit<ActionOptions<C, I, O>, 'id'>, execute: ActionFunction<C, I, O>) {
    // Handle circular module
    const storage: typeof actionsMap = globalThis['actionsMap']
    if (!storage) {
        throw new Error(`please load "action-map" module before registering action.`)
    }
    // console.debug('REGISTER ACTION', info.name)
    if (storage.options.has(info.name)) {
        throw new Error(`Duplicate actions name ${info.name}`)
    }
    const infoWithId: ActionOptions<C, I, O> = Object.assign(info, { id: slugify(info.name) })

    if (!info.configsDefault) {
        info.configsDefault = setDefaultConfig(info.configs)
    }
    if (typeof info.consumes == 'function') {
        info.consumesCode = info.consumes.toString()
    }
    if (typeof info.produces == 'function') {
        info.producesCode = info.produces.toString()
    }
    // console.debug(`Register ${info.name} action..`)
    storage.options.set(infoWithId.id, infoWithId)
    storage.functions.set(infoWithId.id, execute)
}

function getDefaultValueFor(type: ConfigType) {
    switch (type) {
        case 'CHECKBOX':
        case 'SELECT':
            return null
        case 'CODE':
        case 'TEXT':
            return ''
        case 'LIST':
            return []
    }
}

function setDefaultConfig<C extends ConfigOptions>(config: C): ConfigValues<C> {
    const defaultConfig = {}
    Object.entries(config).forEach(([key, opt]) => {
        defaultConfig[key] = opt.default || getDefaultValueFor(opt.type)
    })
    return defaultConfig
}


