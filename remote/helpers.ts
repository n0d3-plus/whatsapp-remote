

import type { MsgPayloadSender } from "../src/types/apps-types"
import type { IWAWebContactModel } from "../src/waweb/WAWebContactModel"
import type { IWAWebWid } from "../src/waweb/WAWebWid"
import { Collections, UserPrefsNotifications, Wid, WidFactory } from "./exports"

/* 
require("WAWebUserPrefsBase").userPreferencesStoreBase.get(
require("WAWebUserPrefsKeys").KEYS.LAST_WID_MD
)
*/
export function getWaInfo() {
    const state: {
        user?: string
        device?: number
        name?: string
        image?: string
        platform?: string
    } = {}
    let wid: IWAWebWid | undefined = undefined
    try {
        const Conn = require('WAWebConnModel').Conn
        state.name = Conn.pushname
        state.platform = Conn.platform
    } catch {
        console.warn('[getWaInfo] fail get pushname/platorm')
    }

    try {
        /* baseGlobal.getMyDeviceJid() // '628572650xxxx:47@s.whatsapp.net'
           baseGlobal.getMyUserJid() //'628572650xxxx@s.whatsapp.net' */
        const baseGlobal = require('WABaseGlobals')
        wid = WidFactory.createWid(baseGlobal.getMyDeviceJid())
        state.user = wid.user
        state.device = wid.device!
    } catch {
        console.log('[getWaInfo] fail get user Wid', wid!)
    }

    try {
        /*
            eurl: "https://pps.whatsapp.net/v/t61.24694-24/491837878_1410285666659042_8034425186643931987_n.jpg?ccb=11-4&oh=01_Q5Aa1wGfHTCLbtz02nmY4lfjkUiDOLpmIEL23vTLPZAZs1_KIg&oe=68784467&_nc_sid=5e03e0&_nc_cat=108"
            filehash: "YVwztY4XpDps0GK3/dDTf6gFDjICTaa1YXRx9hUFvzw="
            fullDirectPath: "/v/t61.24694-24/491837878_1410285666659042_8034425186643931987_n.jpg?ccb=11-4&oh=01_Q5Aa1wGfHTCLbtz02nmY4lfjkUiDOLpmIEL23vTLPZAZs1_KIg&oe=68784467&_nc_sid=5e03e0&_nc_cat=108"
            id: a
            server: "c.us"
            user: "62857265*****"
            _serialized: "62857265*****@c.us"
            previewDirectPath: "/v/t61.24694-24/491837878_1410285666659042_8034425186643931987_n.jpg?stp=dst-jpg_s96x96_tt6&ccb=11-4&oh=01_Q5Aa1wE-04OTUarbhpkPWpdKhjkb1VvPWIqT_ueNYMWGWugcvw&oe=68784467&_nc_sid=5e03e0&_nc_cat=108"
            previewEurl: "https://pps.whatsapp.net/v/t61.24694-24/491837878_1410285666659042_8034425186643931987_n.jpg?stp=dst-jpg_s96x96_tt6&ccb=11-4&oh=01_Q5Aa1wE-04OTUarbhpkPWpdKhjkb1VvPWIqT_ueNYMWGWugcvw&oe=68784467&_nc_sid=5e03e0&_nc_cat=108"
            raw: undefined
            tag: "1748148164"
         */
        if (wid) {
            const myThumb = Collections.ProfilePicThumb.findFirst(v => v.id.user && wid?.user === v.id.user)
            state.image = myThumb?.previewEurl
        }
    } catch {
        console.log('[getWaInfo] fail get user image')
    }

    return state
}

export function dismissNotif() {
    // Dismiss set Notif
    try {
        UserPrefsNotifications.setOfflineNotificationsBBStatus({ isDismissed: true })
        UserPrefsNotifications.setWebNotificationsBBStatus({ isDismissed: true })
    } catch (error) {
        console.warn(error)
    }
}

export function exportSenderFromContact(contact: IWAWebContactModel, wid: IWAWebWid, fromMe?: true): MsgPayloadSender {
    return {
        id: contact.id.toString(),
        name: contact.name || contact.verifiedName || contact.shortName || contact.pushname,
        isInContact: contact.syncToAddressbook,
        isBusiness: contact.isBusiness,
        isEnterprise: contact.isEnterprise,
        verifiedLevel: contact.verifiedLevel,
        verifiedName: contact.verifiedName,
        isUser: wid.isUser(),
        isGroup: wid.isGroup(),
        isMe: fromMe || !!wid['fromMe']
    }
}

export function exportSenderFromWid(wid: IWAWebWid): MsgPayloadSender {
    const contact = Collections.Contact.get(wid)
    if (contact) {
        return exportSenderFromContact(contact, wid)
    } else {
        return {
            id: wid.toString()
        }
    }
}
