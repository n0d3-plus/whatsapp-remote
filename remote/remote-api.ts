import type { IWAWebChatModel } from "@src/waweb/WAWebChatModel"
import { Cmd, Collections, Wid } from "./exports"

const delay = (ms = 500) => new Promise(r => setTimeout(r, ms))

export class RemoteApi {
    /**
     * @param chatId 62857265xxxx@c.us or or g.us
     */
    private getChatById(chatId: string): IWAWebChatModel | undefined {
        return Collections.Chat.findFirst(f => f.id.toString() == chatId)
    }

    async chatFocus(chatId: string, noRead = false) {
        let chat = this.getChatById(chatId)
        if (!chat) return
        const ok = await Cmd.openChatFromUnread(chat, undefined)

        if (!ok) return

        require("WAWebComposeBoxActions").ComposeBoxActions.focus(chat)
        Cmd.scrollToActiveChat()
        if (!noRead) {
            Cmd.markChatUnread(chat, false)
        }
        return chat
    }

    async sendText(chatId: string, msg: string) {
        const chat = await this.chatFocus(chatId)
        if (!chat) return false

        await delay(200)
        require("WAWebComposeBoxActions").ComposeBoxActions.paste(chat, msg)
        await delay(200)
        require("WAWebComposeBoxActions").ComposeBoxActions.send(chat)
    }

    async markRead(chatId: string | IWAWebChatModel, markUnread = false) {
        let chat: IWAWebChatModel | undefined = typeof chatId == 'string' ? this.getChatById(chatId) : chatId
        if (!chat) return
        Cmd.markChatUnread(chat, markUnread)
        //d("WAWebCmd").Cmd.markChatUnread(chat, false)
    }
}

/* 
d("WAWebFrontendMsgGetters").getChat(this.msg);
*/

export const remoteApi = new RemoteApi()
// for debugging in console
window['api'] = remoteApi
