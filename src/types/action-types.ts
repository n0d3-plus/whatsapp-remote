import type { AsyncLocalStorage } from "node:async_hooks";
import type { SandboxRunParam } from "@worker-types";
import type { logger } from "../runner/worker/context";
import type { MsgPayload } from "@apps-types";
import type { MapValue } from "@helper-types";
import type { RemoteApiBridge } from "../runner/worker/remote-api-bridge";

// ACTION CONFIG TYPES

// export type ConfigType = {
//     label?: string
//     desc?: string
//     type: T
//     default?: ConfigMap[T]['valueType']
// }
export type ConfigType = keyof ConfigMap
type ConfigMap = {
    LIST: {
        valueType: Array<any>,
        options: ConfigOptionBase<"LIST"> & {
            itemConfig: ConfigItem
        }
    }
    SELECT: {
        valueType: string,
        options: ConfigOptionBase<"SELECT"> & { options: Array<string> }
    }
    TEXT: {
        valueType: string,
        options: ConfigOptionBase<"TEXT">
    },
    PHONE: {
        valueType: string,
        options: ConfigOptionBase<"PHONE">
    }
    CHECKBOX: {
        valueType: boolean,
        options: ConfigOptionBase<"CHECKBOX">
    }
    CODE: {
        valueType: string,
        options: ConfigOptionBase<"CODE">
    }
}


/** Base property for all action config */
type ConfigOptionBase<T extends ConfigType> = {
    label?: string
    desc?: string
    type: T
    default?: ConfigMap[T]['valueType']
}

export type ConfigOption<T extends ConfigType> = ConfigMap[T]['options']
export type ConfigItem = ConfigMap[ConfigType]['options']
export type ConfigOptions = Record<string, ConfigItem>
export type ConfigValues<C extends ConfigOptions> = {
    [k in keyof C]?: ConfigMap[C[k]["type"]]['valueType']
}

// ACTION DATA TYPES
type DataMap = {
    ANY: {
        valueType: any,
        options: DataOption<'ANY'>
    }
    MESSAGE: {
        valueType: MsgPayload,
        options: DataOption<'MESSAGE'>
    }
    TEXT: {
        valueType: string,
        options: DataOption<'TEXT'>
    }
    WA_ID: {
        valueType: string,
        options: DataOption<'WA_ID'>
    }
    BINARY: {
        valueType: ArrayBufferLike,
        options: DataOption<'BINARY'>
    }
}

export type DataType = keyof DataMap
export const DataType: (keyof DataMap)[] = ['ANY', 'MESSAGE', 'TEXT', 'WA_ID', 'BINARY']

type DataOption<T extends DataType> = {
    label?: string
    required?: boolean
    type: T
}

export type DataItem = DataMap[DataType]['options']
export type DataOptions = Record<string, DataItem>
export type DataOptionsMap = Map<string, DataItem>
export type DataValues<C extends DataOptions> = { [k in keyof C]?: DataMap[C[k]['type']]['valueType'] }


// ACTION NODE TYPES

export type ActionNodeData = {
    /** Action ID (eg: code, on-message) */
    id: string
    label: string
    consumes?: DataOptions
    produces?: DataOptions
    config: ConfigValues<ConfigOptions>
}
type DataOptionsType<T extends DataOptions = DataOptions> = {
    [P in keyof T]: T[P]
}
export enum NodeActionType {
    emitter = 'emitter',
    conditional = 'conditional',
    custom = 'custom',
    remote = 'remote',
}

export type ActionFunction<
    C extends ConfigOptions,
    I extends DataOptions,
    O extends DataOptions
> = (configs: ConfigValues<C>,
    consumes: DataValues<I>,
    store: AsyncLocalStorage<SandboxRunParam>,
    console: typeof logger,
    api: RemoteApiBridge
) => Promise<DataValues<O> | void>

export type ActionOptions<
    C extends ConfigOptions,
    I extends DataOptions,
    O extends DataOptions
> = {
    /** Auto generated from name */
    id: string
    name: string
    desc?: string
    type: NodeActionType | keyof typeof NodeActionType
    // isEmitter?: boolean
    // tags: string[]
    configs: C
    /** Will auto generated if omited */
    configsDefault?: ConfigValues<C>

    consumes: I | ((c: ConfigValues<C>) => I)
    produces: O | ((c: ConfigValues<C>) => O)
    /** if consumes is an function, this is the function code as string */
    consumesCode?: string
    producesCode?: string
}

export type ActionOptionsMap = Map<string, ActionOptions<ConfigOptions, DataOptions, DataOptions>>
export type ActionOptionItem = MapValue<ActionOptionsMap>
export type ActionFunctionsMap = Map<string, ActionFunction<ConfigOptions, DataOptions, DataOptions>>
