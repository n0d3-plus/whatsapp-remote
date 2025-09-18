import { join } from "node:path";
import FileModel from "./models/file-model";
import type { SessionConfig, WorkflowData } from "../../types";
import { randomBytes } from "node:crypto";
import type { FlowExportObject } from "@vue-flow/core";
import defaultConfig from "../../config";
import { unlinkSync } from "node:fs";

export type SessionModelData = {
    /** Default browser args */
    browserArgs: string[] | null,
    /** Whatsapp Web session configuration */
    configs: SessionConfig[]
    /** Current active workflows for each Whatsapp Web session */
    workflows: WorkflowData[]
}

export default class SessionsStorage extends FileModel<SessionModelData> {

    constructor() {
        super('sessions')
    }

    protected getInitialData() {
        return {
            browserArgs: null,
            configs: [],
            workflows: []
        }
    }

    createWorkflow(sessionId: number, flow: FlowExportObject, versionName?: string): WorkflowData {
        const timestamp = Date.now()
        const id = sessionId.toString().padStart(2, '0') + '-' + randomBytes(2).toString('hex') + (timestamp.toString(16))

        return { id, sessionId, timestamp, flow, versionName }
    }

    createSession(): SessionConfig {
        const lastId = this.data.configs.reduce((p, c) => (c.id > p ? c.id : p), 0)
        const id = lastId + 1
        const num = id.toString().padStart(2, '0')
        const name = `WhatsApp ${num}`
        const dataDir = join(defaultConfig.dataDir, num)
        const config = {
            id, name, dataDir
        }
        this.data.configs.push(config)
        this.save()
        return config
    }

    deleteSession(id: number) {
        let index = this.data.configs.findIndex(v => v.id == id)
        if (index >= 0) {
            this.data.configs.splice(index, 1)
            this.save()
        }
    }

    forceResetState(sessionId: number) {
        const session = this.data.configs.find(v => v.id == sessionId)
        if (!session) return
        // clear lock
        const lock = join(session.dataDir, 'SingletonLock')
        try {
            unlinkSync(lock)
        } catch (error) { }
    }
}