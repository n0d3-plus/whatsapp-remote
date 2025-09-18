import { registerAction } from "../action-register"
import { Break } from "../action-utils"

registerAction(
    {
        name: 'Filter Message',
        type: 'conditional',
        configs: {
            filter: {
                type: "SELECT",
                options: ['chat', 'image', 'video'],
                default: 'chat'
            }
        },
        consumes: {
            msg: {
                type: 'MESSAGE',
            }
        },
        produces: {
            msg: {
                type: 'MESSAGE',
            }
        }
    },
    async (configs, consumes) => {
        if (configs.filter && consumes.msg?.type != configs.filter) {
            throw new Break(`Msg type is not ${configs.filter}`)
        }
        return consumes
    }
)
