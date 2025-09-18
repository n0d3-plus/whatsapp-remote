import type { DataOptions } from "@src/types/action-types"

export type HandleDef = {
    id: string
    class: string
    style: Record<string, string>
}

export function populateHandles(current: HandleDef[], data: DataOptions): HandleDef[] {

    const newIds = Object.keys(data)
    let idx: number
    // remove un existed
    const items = current
        .filter((v, i) => {
            idx = newIds.indexOf(v.id)
            if (idx >= 0) {
                // the type may change, re calc it
                v.class = `data-type-${data[v.id].type.toLowerCase()}`
                newIds.splice(idx, 1)
                return true
            }
            return false
        })
    // New added
    items.push(...newIds.map(id => ({
        id, style: {}, class: `data-type-${data[id].type.toLowerCase()}`
    })))

    // Calculate position
    if (items.length <= 1) {
        if (items.length == 1) {
            items[0].style.top = '50%'
        }
        return items
    }
    items.forEach((v, i) => {
        v.style.top = `${((i + 1) / (items.length + 1)) * 100}%`
    })
    return items

}