import type WAWebCollections from "../src/waweb/WAWebCollections"

// Debug events-flow on main components
// const e = require("WAWebEventEmitter")
// const t = e.prototype.trigger
// e.prototype.trigger = function(){

// }

console.log("Events Debugger On..")
// window.addEventListener('mousedown', console.log)
// window.addEventListener('scroll', console.log)
function debugEvent(model, ...args) {
    console.debug(`@${model}`, [...args].map(a => {
        if (a && typeof a == 'object') return a.idClass?.displayName || a.toString()
        return a
    }))
}
require("WAWebCmd").Cmd.on("all", debugEvent.bind(null, 'Cmd'))
require('WAWebSocketModel').Socket.on("all", debugEvent.bind(null, 'SocketModel'))
require('WAWebConnModel').Conn.on("all", debugEvent.bind(null, 'ConnModel'))

// const Collections = require("WAWebCollections") as typeof WAWebCollections
// Collections.Chat.on("all", debugEvent.bind(null, 'Chat'))
// Collections.Contact.on && Collections.Contact.on("all", debugEvent.bind(null, 'Contact'))
// Collections.ChatAssignment.on && Collections.ChatAssignment.on("all", debugEvent.bind(null, 'ChatAssignment'))
// Collections.ChatPreference.on && Collections.ChatPreference.on("all", debugEvent.bind(null, 'ChatPreference'))
// Collections.Msg.on && Collections.Msg.on("all", debugEvent.bind(null, 'Msg'))
// Collections.MsgInfo.on && Collections.MsgInfo.on("all", debugEvent.bind(null, 'MsgInfo'))
// Collections.Status.on && Collections.Status.on("all", debugEvent.bind(null, 'Status'))
// Collections.Label.on && Collections.Label.on("all", debugEvent.bind(null, 'Label'))
// Collections.GroupMetadata.on && Collections.GroupMetadata.on("all", debugEvent.bind(null, 'GroupMetadata'))


/* 
LOGED IN EVENTS
@Cmd ['initial_load_ready']
@Cmd ['ab_props_loaded']
@ConnModel ['me_ready']
@ConnModel (4) ['change:meReadyTriggered', b, true, false]
@ConnModel (2) ['change', b]
@ConnModel (4) ['change:pushname', b, 'Mochamad Arifin', undefined]
@ConnModel (2) ['change', b]
@ConnModel (4) ['change:platform', b, 'iphone', undefined]
@ConnModel (4) ['change:platformField', b, 1, {…}]
@ConnModel (2) ['change', b]
@Cmd ['main_loaded']
@SocketModel (4) ['change:state', b, 'OPENING', 'UNLAUNCHED']
@SocketModel (2) ['change', b]
@Cmd (2) ['set_socket_state', 'OPENING']
@SocketModel (4) ['change:state', b, 'PAIRING', 'OPENING']
@SocketModel (2) ['change', b]
@Cmd (2) ['set_socket_state', 'PAIRING']
@SocketModel (4) ['change:state', b, 'CONNECTED', 'PAIRING']
@SocketModel (2) ['change', b]
@Cmd (2) ['set_socket_state', 'CONNECTED']
@ConnModel ['me_ready']
@Cmd ['open_socket_stream']
@Cmd (2) ['account_temporarily_banned', {…}]
@Cmd ['offline_process_ready']
@Cmd ['offline_progress_update']
@Cmd ['offline_progress_update']
@Chat (4) ['add', 'a [from WAWebWid]', b, {…}]
@Chat (3) ['sort', b, {…}]
*/