import type { Request, Response } from "express"
import zlib from 'node:zlib'
import fs from "node:fs"
import { createReadStream } from "node:fs"
import type { Readable } from "node:stream"
import { cors } from "../handler/cors"

export function logHttpRead(getFilePath: (workerName: string) => string, req: Request, res: Response) {
    
    cors(req, res)

    if (req.method != 'GET' && req.method != 'HEAD') {
        res.sendStatus(405)
        return
    }

    const workerName = req.params.name
    if (!workerName) {
        res.sendStatus(404)
        return
    }

    const logFilePath = getFilePath(workerName)

    let stats: fs.Stats
    try {
        stats = fs.statSync(logFilePath)
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.sendStatus(404)
            return
        } else {
            console.warn(`[RUNNER.HTTP] ${error}`)
        }
    }

    if (!stats) {
        res.sendStatus(500)
        return
    }

    if (stats.size == 0) {
        res.sendStatus(204)
        return
    }

    if (req.method == 'HEAD') {
        res.setHeader('Content-Type', 'text/plain charset=utf-8')
        res.setHeader('Content-Length', stats.size.toString())
        res.status(200)
        res.end()
        return
    }

    let start = 0
    let end = stats.size - 1

    if (req.headers.range) {
        // Parse Range: bytes=start-end
        const match = req.headers.range.match(/bytes=(\d*)-(\d*)/)
        if (match) {
            const [, startStr, endStr] = match
            if (!startStr && endStr) {
                // Range: bytes=-N => last N bytes
                start = Math.max(stats.size - parseInt(endStr, 10), 0)
            } else {
                if (startStr) start = parseInt(startStr, 10)
                if (endStr) end = parseInt(endStr, 10)
            }
        }
    } else {
        let maxSize = parseInt(req.params.size || '500')
        maxSize = (maxSize || 500) * 1024 // size in KiB
        start = Math.max(stats.size - maxSize, 0)
    }

    // Adjust bounds
    start = Math.max(0, start)
    end = Math.min(end, stats.size - 1)
    let stream: Readable = createReadStream(logFilePath, { start, end })
    res.setHeader('Content-Type', 'text/plain charset=utf-8')
    if (req.headers.range) {
        // Send partial content headers, cannot be compressed :-(
        res.status(206)
        res.setHeader('Content-Range', `bytes ${start}-${end}/${stats.size}`)
        res.setHeader('Accept-Ranges', 'bytes')
    } else {
        res.status(200)
        res.setHeader('Content-Encoding', 'gzip')
        stream = stream.pipe(zlib.createGzip())
    }

    stream.pipe(res)
}