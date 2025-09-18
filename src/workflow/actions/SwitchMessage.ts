import { registerAction } from "../action-register"
import { Break } from "../action-utils"

registerAction(
    {
        name: 'Switch Message',
        type: 'conditional',
        desc: `Switch flow based on Message Type: chat, image or video`,
        configs: {},
        consumes: {
            msg: {
                type: 'MESSAGE',
            }
        },
        produces: {
            chat: {
                type: 'MESSAGE',
            },
            image: {
                type: 'MESSAGE',
            },
            video: {
                type: 'MESSAGE',
            }
        }
    },
    async (_configs, consumes) => {
        switch (consumes.msg?.type) {
            case 'chat':
                return { chat: consumes.msg }
            case 'image':
                return { image: consumes.msg }
            case 'video':
                return { video: consumes.msg }
            default:
                throw new Break(`Unknown type ${consumes.msg?.type}`)
        }
    }
)
