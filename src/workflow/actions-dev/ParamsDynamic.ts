import { DataType } from "@action-types";
import { registerAction } from "../action-register";

registerAction(
    {
        name: 'Dynamic Params',
        configs: {
            inputs: {
                type: 'LIST',
                label: 'Inputs',
                default: [],
                itemConfig: {
                    type: "SELECT",
                    options: DataType,
                    label: 'Input',
                }
            }
        },
        type: 'custom',
        consumes: (cfg) => {
            if(!cfg?.inputs) return {}
            return Object.fromEntries(
                cfg.inputs.filter(Boolean).map((v, i) => (
                    [
                        `input${i + 1}`,
                        {
                            type: v,
                            label: `Input ${i + 1}`
                        }
                    ]
                ))
            )
        },
        produces: {
            output1: { type: 'ANY' },
            output2: { type: 'ANY' }
        }
    },
    async (configs, consumes, store, logger) => {
        logger.log('Params', consumes.input1, consumes.input2)
        return {
            output1: 'Out1',
            output2: 'Out2',
        }
    }
)
