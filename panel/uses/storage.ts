import type { ActionOptionItem, ActionOptionsMap } from "@action-types"
import type config from "@src/config"
import type { MsgPayload } from "@src/types/apps-types"

/** Static shared storage */
export const Storage: {
    actions: ActionOptionsMap,
    defaultConfig: typeof config
} = { actions: null!, defaultConfig: null! }

export async function useStorage(): Promise<typeof Storage> {
    if (Storage.defaultConfig)
        return Storage

    await Promise.all([
        fetch('/cfg').then(res => res.json()).then(cfg => Storage.defaultConfig = cfg),
        fetch('/actions').then(res => res.json()).then(
            (res: ActionOptionItem[]) => Storage.actions = new Map(res.map(info => {
                if (typeof info.consumesCode == 'string') {
                    try {
                        info.consumes = eval(info.consumesCode)
                    } catch (error) { console.warn(error) }
                }
                if (typeof info.producesCode == 'string') {
                    try {
                        info.produces = eval(info.producesCode)
                    } catch (error) { console.warn(error) }
                }
                return [info.id, info]
            }))
        )
    ])
    return Storage
}

export const sampleMessageEvent: MsgPayload = {
    id: "28381224D8E1D3A40D",
    type: "chat",
    from: {
        id: "628551000185@c.us",
        name: "IM3",
        isInContact: false,
        isBusiness: true,
        isEnterprise: true,
        verifiedLevel: 2,
        verifiedName: "IM3"
    },
    title: "+62 855-1000-185",
    body: "🔔 *Notifikasi Status Paket dan Promo Kuota Besar!✨*\n\nStatus paket dan Promo Khusus kamu saat ini tersedia di IM3 WhatsApp.\nSilakan cek untuk melihat paket hemat mulai dari 10rb dan informasi promo kuota besar hingga 300GB terkini.\n\nKlik *Cek Paket* untuk info lengkap.",
    isMe: false,
    isUser: true,
    isGroup: false
}

export const sampleConfigs = {
    edges: [
        {
            "id": "vueflow__edge-onmessage1msg-code3input",
            "type": "default",
            "source": "onmessage1",
            "target": "code3",
            "sourceHandle": "msg",
            "targetHandle": "input",
            "data": {},
            "label": "",
            "sourceX": 275,
            "sourceY": 162.828125,
            "targetX": 395,
            "targetY": 218
        },
        {
            "id": "vueflow__edge-onmessage1msg-codecustom2input",
            "type": "default",
            "source": "onmessage1",
            "target": "codecustom2",
            "sourceHandle": "msg",
            "targetHandle": "input",
            "data": {},
            "label": "",
            "sourceX": 275,
            "sourceY": 162.828125,
            "targetX": 195,
            "targetY": 218
        }
    ],
    nodes: [
        {
            "id": "onmessage1",
            "type": "action",
            "initialized": false,
            "position": {
                "x": 200,
                "y": 120
            },
            "data": {
                "action": "OnMessage",
                "label": "OnMessage",
                "produces": {
                    "msg": {
                        "type": "MESSAGE"
                    }
                },
                "config": {
                    "filter": "chat",
                    "contactOnly": null
                }
            }
        },
        {
            "id": "codecustom2",
            "type": "action",
            "initialized": false,
            "position": {
                "x": 120,
                "y": 220
            },
            "data": {
                "action": "CodeCustom",
                "label": "CodeCustom",
                "consumes": {
                    "input": {
                        "type": "ANY"
                    }
                },
                "produces": {
                    "output": {
                        "type": "ANY"
                    }
                },
                "config": {
                    "code": "console.log('in code')",
                    "inputType": "ANY",
                    "outputType": "ANY"
                }
            }
        },
        {
            "id": "code3",
            "type": "action",
            "initialized": false,
            "position": {
                "x": 320,
                "y": 220
            },
            "data": {
                "action": "Code",
                "label": "Code",
                "consumes": {
                    "input": {
                        "type": "ANY"
                    }
                },
                "produces": {
                    "output": {
                        "type": "ANY"
                    }
                },
                "config": {
                    "code": "console.log('in code')"
                }
            }
        }
    ]
}