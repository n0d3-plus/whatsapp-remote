import { registerAction } from "../action-register";

registerAction(
    {
        name: 'Params',
        configs: {},
        type: 'conditional',
        consumes: {
            input1: { type: 'ANY', required: true },
            input2: { type: 'ANY', required: true }
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
