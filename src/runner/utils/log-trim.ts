/**
 * Trim log object by detecting refs
 */

import type { KernelProcess } from "@worker-types";

type Keys = (string | number)[]

function scanRefs(map: WeakMap<any, Keys>, obj: any, parentKey: Keys = []) {

    if (!obj || typeof obj !== 'object') return

    let key: Keys

    if (Array.isArray(obj)) {
        obj.forEach((v, k) => {
            key = parentKey.slice()
            key.push(k)
            scanRefs(map, v, key)
        })
    } else {
        let v: any
        Object.keys(obj).forEach(field => {
            v = obj[field]
            if (v && typeof v == 'object') {
                if (map.has(v)) {
                    key = map.get(v)
                    obj[field] = { $: key.join('.') }
                } else {
                    key = parentKey.slice()
                    key.push(field)
                    map.set(v, key)
                    scanRefs(map, v, key)
                }
            }
        })
    }
}

function getObject(root: any, key: Keys) {
    while (key.length) {
        if (!root) return undefined
        root = root[key.shift()]
    }
    return root
}

function restoreRefs(root: KernelProcess, obj: any) {

    if (!obj || typeof obj !== 'object') return
    if (Array.isArray(obj)) {
        obj.forEach(v => restoreRefs(root, v))
    } else {
        Object.keys(obj).forEach(field => {
            if (obj[field] && typeof obj[field] == 'object') {

                if ('$' in obj[field]) {
                    obj[field] = getObject(root, obj[field].$.split('.'))
                } else {
                    restoreRefs(root, obj[field])
                }
            }
        })
    }
}

export function kernelProcessTrim(log: KernelProcess): string {
    const map = new WeakMap<any, Keys>()
    if (log.data) {
        scanRefs(map, log.data, ['data'])
    }
    if (log.executions) {
        log.executions.forEach((log, i) => {
            scanRefs(map, log, ['executions', i])
        })
    }

    const str = JSON.stringify(log)
    return str + "\n"
}

export function kernelProcessRestore(str: string) {
    const obj: KernelProcess = JSON.parse(str)
    restoreRefs(obj, obj.data)
    restoreRefs(obj, obj.executions)
    return obj
}