import type { SenderBase } from "@apps-types"
import { registerAction } from "../action-register"
import { Break } from "../action-utils"

registerAction(
    {
        name: 'Filter Sender',
        type: 'conditional',
        configs: {
            contactOnly: {
                label: 'in Contact Only',
                desc: 'Only accept message for user in contact',
                type: "CHECKBOX",
                default: false
            },
            fromMeOnly: {
                label: 'from Me Only',
                desc: 'Only accept message from your self',
                type: "CHECKBOX",
                default: false
            },
            groupOnly: {
                label: 'Group Chat Only',
                desc: 'Only accept message from groups',
                type: "CHECKBOX",
                default: false
            },
            userOnly: {
                label: 'User Chat Only',
                desc: 'Only accept message from users',
                type: "CHECKBOX",
                default: false
            },
            thisNumberOnly: {
                label: 'Specific Numbers',
                desc: 'Only accept message from this numbers',
                type: "LIST",
                itemConfig: {
                    label: 'Phone Number',
                    type: 'PHONE'
                },
            },
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
        if (configs.groupOnly && !consumes.msg.isGroup) {
            throw new Break(`Not from Group`)
        }
        if (configs.thisNumberOnly?.length) {
            let wa_id: string
            if (consumes.msg.isGroup) {
                // get the number
                wa_id = consumes.msg.author.id
            } else {
                wa_id = consumes.msg.from.id
            }
            if (!configs.thisNumberOnly.some(v => v == wa_id)) {
                throw new Break(`Not in list items: ${wa_id}`)
            }

            // pass it, no further checks
            return consumes
        }

        if (consumes.msg.isGroup) {
            if (configs.fromMeOnly && !consumes.msg.author?.isMe) {
                throw new Break(`Author is not Me`)
            }
            if (configs.contactOnly && !consumes.msg.author?.isInContact) {
                throw new Break(`Author is not in contact`)
            }
            if (configs.userOnly && !consumes.msg.author?.isBusiness) {
                throw new Break(`Author is not User`)
            }
        } else {
            if (configs.fromMeOnly && !consumes.msg.isMe) {
                throw new Break(`Not from Me`)
            }

            if (configs.contactOnly && !consumes.msg.from?.isInContact) {
                throw new Break(`Sender is not in contact`)
            }

            if (configs.userOnly && !consumes.msg.isUser) {
                throw new Break(`Not from User`)
            }
        }


        return consumes
    }
)
