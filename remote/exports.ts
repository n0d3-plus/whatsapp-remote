// Export WAWeb Modules

import type WAWebCollections from "../src/waweb/WAWebCollections"
import type { IWAWebCmd } from "../src/waweb/WAWebCmd"
import type { IWAWebWid, WAWebWidStatic } from "../src/waweb/WAWebWid"
import type { IWAWebWidFactory } from "../src/waweb/WAWebWidFactory"

/**
 * modules:
 * - require('WAWebCollections').Chat
 * - require("WAWebChatCollection").ChatCollection
 */
export const Collections = require("WAWebCollections") as typeof WAWebCollections
export const Socket = require('WAWebSocketModel').Socket
export const Conn = require('WAWebConnModel').Conn
export const SignalStoreApi = require('WAWebSignalStoreApi').waSignalStore
export const Base64 = require('WABase64')
export const AdvSignatureApi = require('WAWebAdvSignatureApi')
export const UserPrefsInfoStore = require('WAWebUserPrefsInfoStore')
export const CompanionRegClientUtils = require('WAWebCompanionRegClientUtils')
export const AltDeviceLinkingApi = require('WAWebAltDeviceLinkingApi')
export const Cmd: IWAWebCmd = require('WAWebCmd').Cmd
export const UserPrefsNotifications = require('WAWebUserPrefsNotifications')
export const Wid: WAWebWidStatic = require('WAWebWid')
export const WidFactory: IWAWebWidFactory = require('WAWebWidFactory')
// export const ChatGetters = require('WAWebChatGetters')
