// import { assert } from "node:console";
import assert from "node:assert";
import { Kernel } from "../runner/worker/kernel";
import type { SandboxRunParam, WorkerConfig } from "@worker-types";
// import "../workflow/action-loader" //Load actions
import { actionsMap } from "../workflow/action-map";
import type { MsgPayload } from "@apps-types";
// import { MSG_TYPE } from "../waweb/WAWebMsgType";
import { createSandbox } from "../runner/worker/sandbox";
import { inspect } from "node:util";
inspect.defaultOptions.depth = 4

const workerName = "WhatsApp Test"
const workflowConfigSample: WorkerConfig = {
    nodes: {
        onmessage: {
            actionId: "onmessage",
            config: {
                filter: "chat",
                contactOnly: false
            }
        },
        code: {
            actionId: "code",
            config: { code: "console.log('in code')\n\nreturn input" }
        },
        "dev-dynamic": {
            actionId: "dev-dynamic",
            config: {
                code: "console.log('in code')",
                inputType: "MESSAGE",
                outputType: "TEXT"
            }
        },
        code2: {
            actionId: "code",
            config: { code: "console.log('in code')" }
        },
        "dev-basic": {
            actionId: "dev-basic",
            config: {
                list: null,
                select: "A",
                text: "jjj",
                checkbox: true,
                code: null
            }
        }
    },
    chains: ["onmessage:msg>code:input",
        "onmessage:msg>dev-dynamic:input",
        "code:output>code2:input",
        "dev-dynamic:output>code2:input",
        "code2:output>dev-basic:input"]
}
const msgSample: MsgPayload = {
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
async function flowTest() {
    // heads
    const sandbox = await createSandbox(workerName, workflowConfigSample, actionsMap)
    const kernel = new Kernel(workflowConfigSample, actionsMap.options, sandbox)
    // console.debug(kernel.consumers, kernel.producers)
    assert.deepStrictEqual(kernel.nodeLayers[0][0].nodeId, 'onmessage')
    assert.deepStrictEqual(kernel.nodeLayers.map(v => v.length), [1, 2, 1, 1])
    assert.strictEqual(kernel.validateWorkflow(), true)

    const result = await kernel.startWorkflow(msgSample)
    console.log(result)
}


flowTest()