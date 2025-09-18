import type { IWAWebChatModel } from "../src/waweb/WAWebChatModel"
import type { IWAWebWid } from "../src/waweb/WAWebWid"
import type { IWAWebMsgModel } from "../src/waweb/WAWebMsgModel"
import type { MSG_TYPE } from "../src/waweb/WAWebMsgType"
import type { MsgPayload } from "../src/types/apps-types"

import { dismissNotif, exportSenderFromContact, exportSenderFromWid, getWaInfo } from "./helpers"
import { Cmd, Collections, Wid } from "./exports"
let unreadCounter = 0
export class Runtime {

    info!: ReturnType<typeof getWaInfo>

    async start() {
        // Monitor unread count, can't read fromMe message
        Collections.Chat.on("add remove reset change:showUnreadInTitle", () => {
            _wa_state_delayed('unread', Collections.Chat.getUnreadCount())
        })
        // Cmd.on('ui_idle', function(){
        //     console.log('GOT ui_idle', arguments)
        // })
        // Cmd.on('offline_delivery_end', function(){
        //     console.log('GOT offline_delivery_end', arguments)
        // })
        // Cmd.on('offline_progress_update', function(){
        //     console.log('GOT offline_progress_update', arguments)
        // })
        // Cmd.on('offline_process_ready', function(){
        //     console.log('GOT offline_process_ready', arguments)
        // })
        console.debug('Wait chat sync..')
        // Msg add is triggered during this phase, but it ignored
        await this.waitChatSync()
        console.debug('Done chat sync..')
        this.info = getWaInfo()
        console.log('info', this.info)
        _wa_state_('ready', this.info)

        // if (Collections.Chat.getUnreadCount()) {
        //     this.findUnreadOldChats()
        // }
        // Message from self not detected in alert_new_msg
        Cmd.on('alert_new_msg', (msg: IWAWebMsgModel) => {
            console.log('alert_new_msg', msg.from?.toString())
            if (this.shouldProcessMsg(msg)) {
                this.processUnreadMsg(msg)
            }
        })
        const myChat = Collections.Chat.findFirst(v => v.id.user && v.id.user == this.info?.user)
        if (myChat) {
            myChat.msgs.on('add', this.processSelfMessage)
        }else{
            console.log('No self-chat found', myChat.id)
        }
        // Only get fromMe
        // Collections.Msg.on("add", this.maybeFromMe)

        dismissNotif()
    }

    private waitChatSync(timeout = 500) {
        return new Promise((r, j) => {
            let timer
            const clear = () => {
                Collections.Msg.off("add", waitReady)
                Collections.Chat.off("add", waitReady)
            }
            const deadLine = setTimeout(() => {
                console.warn(`Deadline wait chat sync.`)
                clear()
                r(true)
            }, 10e3)

            const waitReady = () => {
                clearTimeout(timer)
                timer = setTimeout(() => {
                    clearTimeout(deadLine)
                    clear()
                    r(true)
                }, timeout)
            }
            Collections.Msg.on("add", waitReady)
            Collections.Chat.on("change", waitReady)
        })
    }

    onlyReceive: (`${MSG_TYPE}`)[] = ['image', 'chat', 'ciphertext', 'audio', 'vcard', 'video', 'document', 'location']

    private shouldProcessMsg(msg: IWAWebMsgModel, verbose?: boolean): undefined | true {
        if (!this.onlyReceive.includes(msg.type)) {
            verbose && console.debug(`[Ignore Msg] ${msg.id} ${msg.from.toString()} ${msg.type}: Type whitelist filter`)
            return
        }
        if (msg.viewed) {
            verbose && console.debug(`[Ignore Msg] ${msg.id} ${msg.from.toString()} ${msg.type}: Already viewed`)
            return
        }
        if (Wid.isStatus(msg.id)) {
            verbose && console.debug(`[Ignore Msg] ${msg.id} ${msg.from.toString()} ${msg.type}: Status update`)
            return
        }
        if (msg.from.isBroadcast()) {
            verbose && console.debug(`[Ignore Msg] ${msg.id} ${msg.from.toString()} ${msg.type}: Broadcast message`)
            return
        }
        if (msg['remoteProcessed']) {
            verbose && console.debug(`[Ignore Msg] ${msg.id} ${msg.from.toString()} ${msg.type}: Already processed`)
            return
        }

        return true
    }

    private processSelfMessage = (msg: IWAWebMsgModel, chat: any /* IWAWebChatModel */, acts: { add: boolean, remove: boolean, merge: boolean }) => {
        if (!msg.id.fromMe) {
            // console.debug(`[processSelfMessage] ${msg.id} ${msg.author} ${msg.type}: Not from me`)
            return
        }
        // avoid circullaer message, no author/device mean message from this wa web
        if (!msg.author || msg.author?.device === this.info.device) {
            return
        }

        if (!this.shouldProcessMsg(msg)) {
            return
        }

        // if (!msg.isNewMsg) {
        //     console.debug(`[processSelfMessage] ${msg.id} ${msg.author} ${msg.type}: Not new`)
        //     return
        // }

        if (msg.type == 'ciphertext') {
            // console.debug(`[processSelfMessage] ${msg.id} ${msg.author} ${msg.type}: Got cipher`)
            msg.once('change:type', () => this.processUnreadMsg(msg))
        } else {
            this.processUnreadMsg(msg)
        }
    }

    private findUnreadOldChats = () => {
        console.debug('findUnreadOldChats')
        const haveUnreadsChats = Collections.Chat.filter(
            c => c.showUnreadInTitle)
        console.debug('findUnreadOldChats, got', haveUnreadsChats.length)
        haveUnreadsChats.forEach((chat) => this.processUnreadChat(chat))
    }

    processUnreadChat(chat: IWAWebChatModel, msg?: IWAWebMsgModel) {

        const title = chat.title()
        const name = chat.contact?.name || chat.contact?.pushname
        const lastMsg = msg || chat.msgs.last()

        if (!lastMsg) {
            console.debug(`[processUnreadChat] No lastMsg in ${name || title || chat}`)
            return
        }

        if (!this.shouldProcessMsg(lastMsg, true)) {
            console.debug(`[processUnreadChat] not processing ${name || title || chat}`)
            return
        }
        console.log('[processUnreadChat] Got unread', title, lastMsg.body)
        this.processUnreadMsg(lastMsg, chat)
    }

    private processUnreadMsg(msg: IWAWebMsgModel, chat?: IWAWebChatModel) {
        // Flag in our runtime to prevent duplicate notification
        // if (msg.viewed) {
        //     console.debug(`From ${msg.from}: Already viewed`)
        //     return
        // }

        // if (msg.from.isBroadcast()) {
        //     console.debug(`Ignored broadcast message`)
        //     return
        // }

        // if (msg['remoteProcessed']) {
        //     console.debug(`From ${msg.from}: Already processed`)
        //     return // already know
        // }

        msg['remoteProcessed'] = true
        if (!chat) {
            chat = Collections.Chat.get(msg.from)
            // High level, will get newsLeterChat too
            // d("WAWebFrontendMsgGetters").getChat(this)
        }

        if (!chat) {
            console.warn(`Chat not found for msg:`, msg.toJSON())
            return;
        }

        const waMsg: MsgPayload = {
            id: msg.id.id,
            type: msg.type,
            // is "from"
            // remote: msg.id.remote,

            // is "author" if from group
            // participant: msg.id.participant,

            // group or user: eg 120363330084307086@g.us, user
            from: exportSenderFromContact(chat.contact, chat.id, msg.id.fromMe),
            // If from group, author is the creator: 62****2221832@c.us
            author: msg.author ? exportSenderFromWid(msg.author) : undefined,
            title: chat.title(),
            body: msg.body,
            // isFromMe: msg.id.fromMe,
            isMe: msg.id.fromMe,
            isUser: msg.from.isUser(),
            isGroup: msg.from.isGroup(),
        }

        // console.log(payload, msg)
        if (REMOTE.config.devtools) {
            console.log('New Message', waMsg, msg)
        }

        _msg_(waMsg)
        console.log(`Unread Counter`, ++unreadCounter)
        if (unreadCounter + 100 >= Number.MAX_SAFE_INTEGER - 100)
            unreadCounter = 0
    }
}
