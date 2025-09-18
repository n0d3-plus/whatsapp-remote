import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { messageBox } from "../../../utils/os";
import config from "../../../config";

export default abstract class FileModel<T = any> {
    version: string
    data: T
    filePath: string

    protected abstract getInitialData(): T

    constructor(protected name: string) {
        this.filePath = join(config.dataDir, this.name + '.json');
        if (existsSync(this.filePath)) {
            this.loadData()
        } else {
            this.data = this.getInitialData()
        }
    }

    protected loadData() {
        try {
            console.debug(`Loading ${this.filePath}`)
            const data = JSON.parse(readFileSync(this.filePath, 'ascii'))
            if (!data['version']) {
                console.warn(`Load DB file "${this.name}": Config version not found, ignored.`)
                return
            }
            if (data.version !== config.version) {
                console.warn(`Load DB file "${this.name}": Version miss-match, ${data.version} vs ${config.version}`)
                // todo: version upgrade if required
                // this.onVersionMissmatch(data)
            }
            this.version = data.version
            this.data = data.data

        } catch (error) {
            console.error(error)
            messageBox(`Can't load config: ${error.message}`)
        }
    }

    save() {
        const data = { version: config.version, data: this.data }
        const content = JSON.stringify(data, null, 2)
        writeFileSync(this.filePath, content, 'ascii');
    }

}