import { registerAction } from "../action-register";
import { DataType } from "../../types/action-types";

registerAction({
    name: 'Dev Dynamic',
    configs: {
        code: {
            type: "CODE",
            default: "console.log('in code')",
        },
        inputType: {
            type: "SELECT",
            default: 'ANY',
            options: DataType
        },
        outputType: {
            type: "SELECT",
            default: 'ANY',
            options: DataType
        }
    },
    type: 'custom',
    consumes: ((c) => ({
        input: { type: c.inputType as any }
    })),
    produces: (c) => {
        return {
            output: { type: c.outputType as any }
        }
    },
}, async (configs, consumes, store, console) => {
    const output = eval(configs.code?.toString())
    return { output }
})
