import { createServer } from "node:http";
import { Runner } from "./runner";
import express from "express"
import { setupHttpHandler } from "./handler";

function checkPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const server = createServer()
            .once('error', () => resolve(false))
            .once('listening', () => server.close(() => resolve(true)))
            .listen(port);
    })
}

let port = 3000
while (!await checkPort(port)) {
    port++
}

const app = express()
const server = createServer(app)
const runner = new Runner(server)
setupHttpHandler(app, runner)

server.listen(port, () => {
    console.debug(`[RUNNER]: Listening on http://127.0.0.1:${port}/`)
})
