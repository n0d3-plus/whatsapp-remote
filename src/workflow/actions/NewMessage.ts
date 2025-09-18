import { registerAction } from "../action-register"
import { Break } from "../action-utils"

registerAction(
    {
        name: 'New Message',
        type: 'emitter',
        desc: 'Auto start when receive new message.',
        configs: {},
        consumes: {
            msg: {
                type: 'MESSAGE',
                required: true
            }
        },
        produces: {
            msg: {
                type: 'MESSAGE',
                required: true
            }
        }
    },
    async (configs, consumes) => consumes
)
