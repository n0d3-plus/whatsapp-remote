import type { Application } from "express";
import config from "../../config"
import { resolve } from "node:path"
import fs from "node:fs"
import { logHttpRead } from "../utils/log-http-read";
import type { Runner } from "../runner";
import { cors } from "./cors";

export function setupHttpHandler(app: Application, runner: Runner) {

    const getLogFile = (workerName) => resolve(config.workerLogsDir, `${workerName}.log`)
    const getHistoryFile = (workerName) => resolve(config.workerLogsDir, `${workerName}.json.log`)

    const workerLogHandler = logHttpRead.bind(null, getLogFile)
    const workerExecHandler = logHttpRead.bind(null, getHistoryFile)

    app.route('/worker-log/:name{/:size}')
        .get(workerLogHandler)
        .head(workerLogHandler)
        .options(cors)
        .delete((req, res) => {

            cors(req, res)

            if (!req.params.name) {
                res.sendStatus(500)
                return
            }

            const controller = runner.workers.get(req.params.name)
            if (controller) {
                // Gracefull reset log if controller already running
                controller.clearLogFile()
                    .then(() => res.sendStatus(200))
                    .catch(() => res.sendStatus(500))
            } else {
                // just delete if file exist
                const filePath = getLogFile(req.params.name)
                fs.unlink(filePath, (err) => {
                    res.sendStatus(err ? 404 : 200)
                })

            }

        })

    app.route('/worker-execution/:name{/:size}')
        .get(workerExecHandler)
        .head(workerExecHandler)
        .options(cors)
        .delete((req, res) => {

            cors(req, res)

            if (!req.params.name) {
                res.sendStatus(500)
                return
            }
            const controller = runner.workers.get(req.params.name)
            if (controller) {
                // Gracefull reset history if controller already running
                controller.sendToSandbox('clearHistory')
                    .then(() => res.sendStatus(200))
                    .catch(() => res.sendStatus(500))
            } else {
                // just delete if file exist
                const filePath = getHistoryFile(req.params.name)
                fs.unlink(filePath, (err) => {
                    res.sendStatus(err ? 404 : 200)
                })
            }

        })


    app.get('/', (_req, res) => {
        const mem = process.memoryUsage();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            rss: mem.rss,
            heapUsed: mem.heapUsed,
            heapTotal: mem.heapTotal,
            uptime: process.uptime(),
        }));
    })

    // Not found
    app.get('/{*all}', (req, res) => {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    })

    app.use((err, req, res, next) => {
        console.warn('[RUNNER.HTTP WRAP-ERROR]', err); // Log the error for debugging
        res.status(500).send({ error: err.message || err }); // Send a generic error response to the client
    })

}