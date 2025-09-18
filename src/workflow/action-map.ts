import { readdirSync } from "node:fs";
import path from "node:path";
import config from "../config";
import { pathToFileURL } from "node:url";

import type { ActionFunctionsMap, ActionOptionsMap } from "../types/action-types";

async function loadActionsIn(dir = 'actions') {
    const absolutePath = path.resolve(import.meta.dirname, dir);
    const files = readdirSync(absolutePath);
    const exts = ['.ts', '.js', '.mjs']
    // console.debug('Load all workflow actions..')
    return Promise.all(files
        .filter(file => exts.includes(path.extname(file)))
        .map(file => {
            const modulePath = path.join(absolutePath, file);
            return import(pathToFileURL(modulePath).href)
        })
    )
}

export const actionsMap = {
    functions: new Map() as ActionFunctionsMap,
    options: new Map() as ActionOptionsMap
}
// Handle circular module
globalThis['actionsMap'] = actionsMap
// Load actions
await loadActionsIn("actions")
if (config.isLiveDev) {
    await loadActionsIn("actions-dev")
}

