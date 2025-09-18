import { registerAction } from "../action-register";

registerAction(
    {
        name: 'Dev Basic',
        desc: 'Dummy test action',
        configs: {
            list: {
                type: "LIST",
                itemConfig: {
                    type: "TEXT"
                }
            },
            select: {
                type: "SELECT",
                options: ['A', 'B', 'C']
            },
            text: {
                type: "TEXT"
            },
            checkbox: {
                type: "CHECKBOX"
            },
            code: {
                type: "CODE"
            }
        },
        type: 'custom',
        consumes: {
            input: { type: 'ANY' }
        },
        produces: {
            output: { type: 'ANY' }
        }
    },
    async (cfg, cs) => {
        return { output: cs.input }
    }
)

