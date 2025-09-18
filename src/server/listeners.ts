import express from "express"
import { createServer } from "node:http"
import { WsServer } from "./websocket";

export const APP = express()
export const SERVER = createServer(APP)
export const WS = new WsServer(SERVER)
