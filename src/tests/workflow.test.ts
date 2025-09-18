// import { assert } from "node:console";
import assert from "node:assert";
import { startWorker } from "../runner/worker-controller";
import type { WorkerConfig } from "../types/worker-types";
import { Runner } from "../runner/runner";
import { RunnerController } from "../workflow/runner-controller/controller";
import { WebSocket } from "ws";
import { createSandbox } from "../runner/worker/sandbox";
import { workerClientConnector } from "../utils/shared";
import { actionsMap } from "../workflow/action-map";
import { isSandboxError, sandboxToError } from "../runner/worker/utils";

async function sandboxVMTest(input = 'AAAX') {
    const value1 = Date.now().toString(36)
    const config: WorkerConfig = {
        nodes: {
            node1: {
                actionId: 'code',
                config: {
                    code: `
                    await new Promise(r => setTimeout(r,0))
                    return "${value1}" + input
                    `.trim()
                }
            }
        },
        chains: []
    }

    const sandbox = await createSandbox('sandboxVMTest', config, actionsMap)

    async function runInSandbox(data: Parameters<typeof sandbox>[0]) {
        return sandbox(data)
            .then(result => {
                // run result
                if (isSandboxError(result))
                    return Promise.reject(sandboxToError(result))
                else
                    return result
            })
    }

    const produces = await runInSandbox({
        nodeId: 'node1',
        consumes: { input }
    })
    assert.strictEqual(produces.output, value1 + input)
    console.debug('VM TEST', produces.output)

    // Update the config, should reflect in VM sandbox too
    const udpateVal = new Date().toISOString()
    config.nodes.node1.config.code = `return "${udpateVal}" + input`
    const produces2 = await runInSandbox({
        nodeId: 'node1',
        consumes: { input }
    })

    assert.strictEqual(produces2.output, udpateVal + input)
    console.debug('VM TEST', produces2.output)

    await runInSandbox('exit')
}

async function sandboxErrorTest() {
    const config: WorkerConfig = {
        nodes: {},
        chains: []
    }

    const sandbox = await createSandbox('test', config, actionsMap)

    await assert.doesNotReject(sandbox({
        nodeId: 'not-exists', consumes: {}
    }))

    await sandbox('exit')
}
async function workerControllerTest() {
    const value1 = "ASDF";
    const cfg: WorkerConfig = {
        // session: {
        //     id: 233,
        //     dataDir: '',
        //     name: 'Dummy session'
        // },
        chains: [],
        nodes: {
            aaa: {
                actionId: 'code',
                config: {
                    code: `return "${value1}" + input`
                },
            }
        }
    }

    // const controller = new WorkerController(cfg)
    // await controller.start()
    const controller = await startWorker('test', cfg)
    console.log('WorkerController started')
    const ret = await controller.run('aaa', { input: '1122' })
    console.log('WorkerController produces', ret)
    assert.strictEqual(ret.output, 'ASDF1122')

    // Update config
    const newCode = `await new Promise(r => setTimeout(r, delay)); return "!@#X${value1}" + input`
    controller.sendToSandbox('patchConfig', {
        nodes: {
            aaa: {
                config: { code: newCode }
            }
        }
    })
    const ret2 = await Promise.all([
        controller.run('aaa', { input: '1122', delay: 5 }),
        controller.run('aaa', { input: '1133', delay: 0 }),
    ])
    console.log('WorkerController produces', ret2)
    assert.strictEqual(ret2[0].output, '!@#XASDF1122')
    assert.strictEqual(ret2[1].output, '!@#XASDF1133')

    await controller.destroy()
}

async function workerErrorTest() {
    const config: WorkerConfig = {
        nodes: {
            a: { actionId: 'not-exist', config: {} }
        },
        chains: []
    }

    const worker = await startWorker('test2', config, null, true)

    await assert.rejects(
        worker.run('not-exists', {}),
        {
            message: 'NodeId not found'
        }
    )

    await assert.rejects(
        worker.run('a', {}),
        {
            message: 'Action id not found: not-exist'
        }
    )

    await worker.destroy()
}

const workflowConfigSample = {
    name: 'test',
    nodes: {
        onmessage: {
            actionId: "onmessage",
            config: {
                filter: "chat",
                contactOnly: null
            }
        },
        code: {
            actionId: "code",
            config: {
                code: "console.log('Action User Code runs')\nawait new Promise(r => setTimeout(r,0))\nreturn input"
            }
        }
    },
    chains: ["onmessage:msg>code:input"]
}

async function processClientTest() {
    const pc = new Runner({
        on: () => { },
        once: () => { },
        close: () => { },
    } as any)
    const inputValue = Date.now().toString()
    const worker = await pc.startWorker('test', workflowConfigSample)

    // const worker = pc.workers.get(result.workerId)

    const ret = await worker.run('code', {
        input: inputValue
    })

    await pc.destroy()
    assert.deepStrictEqual(ret.output, inputValue)

    // console.debug('worker destroyed')
    await assert.rejects(worker.run('code', {
        input: {
            id: {},
        }
    }))
}

function connectWS(url) {
    return new Promise<WebSocket>((r, j) => {
        console.log(`Connecting`, url)
        const ws = new WebSocket(url)
        ws.once('open', () => r(ws))
        // ws.once('close', j)
    })
}

async function runnerTest() {
    let runner: RunnerController
    await assert.doesNotReject(
        () => import('../workflow/runner-controller').then(({ processServer }) => runner = processServer)
    )
    // @ts-ignore fake parent process
    process.send = (...args: any[]) => { console.debug(`FAKE.process.send(${args})`) }
    const thread = await runner.ipcSend('startWorker', ['test', workflowConfigSample])

    console.log('Thread', thread)

    const ws = await connectWS(runner.getWorkerWsUrl(thread.name))// thread.workerUrl)
    const wr = workerClientConnector(ws)

    await wr.send('run', { nodeId: 'code1', consumes: { input: 'aaa' } }).then(r => {
        console.log('RUN', r)
    })

    const ret = await wr.send('run', { nodeId: 'code', consumes: { input: 'aaa' } })
    assert.deepStrictEqual(ret, { output: 'aaa' })

    // ws.on('message', (msg) => {
    //     console.debug(msg)
    // })
    // ws.on('close', (msg) => {
    //     console.debug('WS RUNNER Closed.',msg)
    //     wr.stop()
    // })
    // ws.send(JSON.stringify({ cmd: 'run' }))

    await runner.ipcSend('destroy', [])
}

process.once('exit', () => console.debug('--- Test Exit ---'))
console.log('sandboxErrorTest')
await sandboxErrorTest()
console.log('workerErrorTest')
await workerErrorTest()
console.log('sandboxVMTest')
await Promise.all([
    sandboxVMTest('CC'),
    sandboxVMTest('ASD'),
    sandboxVMTest('DHFJKJ')
])
console.log('workerControllerTest')
await workerControllerTest()
console.log('processClientTest')
await processClientTest()
console.log('runnerTest')
await runnerTest()
