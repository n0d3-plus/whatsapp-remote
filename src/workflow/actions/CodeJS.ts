import { registerAction } from "../action-register";

const AsyncFunction = Object.getPrototypeOf(async function () { }).constructor;

registerAction(
    {
        name: 'Code JS',
        configs: {
            code: {
                type: "CODE",
                default: "console.log('in code')\nawait new Promise(r => setTimeout(r,1000))"
            }
        },
        type: 'custom',
        consumes: {
            input: { type: 'ANY' },
        },
        produces: {
            output: { type: 'ANY' },
        }
    },
    async (configs, consumes, store, logger) => {
        // const self: any = this || {}
        // self['output'] = null
        // logger.log('inCode action', this)
        // const { node } = store.getStore()
        const args = ['store', 'console', ...Object.keys(consumes)]
        const f = new AsyncFunction(args, configs.code)
        let output = await f(store, logger, ...Object.values(consumes))
        // if (typeof output?.then == 'function')
        //     output = await output
        return { output }
    }
)
