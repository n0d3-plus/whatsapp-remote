import { registerAction } from "../action-register"
import { Break } from "../action-utils"

registerAction(
    {
        name: 'Reply Message',
        type: 'remote',
        configs: {
            message: {
                type: "TEXT",
            },
        },
        consumes: {
            msg: {
                type: 'MESSAGE',
            }
        },
        produces: { }
    },
    async (configs, consumes, store, console, api) => {
        if (!configs.message) {
            throw new Break('Empty message')
        }
        await api.sendCommand('sendText', [consumes.msg.from.id, configs.message])
        return
    }
)
