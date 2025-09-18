import type { Request, Response } from "express"

export function cors(req: Request, res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*') // allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,DELETE,OPTIONS') // allowed methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range') // allowed headers
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Encoding')
    res.setHeader('Access-Control-Max-Age', `${60 * 60 * 24}`) // cache preflight for 600 seconds

    if (req.method == 'OPTIONS') { // end here
        res.sendStatus(200)
    }
}