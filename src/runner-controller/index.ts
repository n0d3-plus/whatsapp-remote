import { fork, type SendHandle, type Serializable } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { RunnerController } from './controller'
import type { IpcMessage } from '@runner-types'

const runnerEntryPoint = fileURLToPath(import.meta.resolve('../runner/index'))
console.time('START RUNNER')

const runnerProcess = fork(runnerEntryPoint, [], {
    stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
    env: { IS_RUNNER: '1', ...process.env }
})

// wait its ready
const listenPort = await new Promise<number>(async (r, j) => {
    const serverSetupHandler = (message: IpcMessage, _sendHandle: SendHandle) => {
        if (message?.type == 'ready') {
            runnerProcess.off('message', serverSetupHandler) // turn off our listener
            return r(message.port) // resolve the promise
        }
        // forward to parent process
        // process.send(message, sendHandle)
    }
    runnerProcess.on('message', serverSetupHandler)
})
console.timeEnd('START RUNNER')
// console.debug(`Runner ready on ${listenPort} with PID:`, runnerProcess.pid)

export const processServer = new RunnerController(runnerProcess, listenPort)