<template>
    <v-snackbar v-for="([id, popup]) in popups" :key="id" :color="popup.type" v-model="popup.state"
        :timeout="popup.timeout" class="mt-1">
        {{ popup.message }}
        <template v-slot:actions>
            <v-icon @click="popup.state = false">close</v-icon>
        </template>
    </v-snackbar>
</template>


<script lang="ts">
import { reactive } from "vue";

export interface Popup {
    type: 'error' | 'info' | 'success' | 'warning',
    message: string
    timeout?: number
    state?: boolean
}

const popups = reactive<Map<string, Popup>>(new Map())

export const popup = (payload: Pick<Popup, 'message' | 'type' | 'timeout'> | string, type?: Popup['type']) => {
    let item: Popup

    const id = Math.round(Math.random() * 100000).toString(32) + Date.now().toString(32)
    if (typeof payload != 'object') {
        item = {
            type: type || 'info',
            message: payload,
        }
    } else {
        item = { ...payload }
    }

    Object.defineProperty(item, 'state', {
        get() { return true },
        set: popups.delete.bind(popups, id)
    })

    popups.set(id, item)

}

export default {
    setup() {
        return {
            popups, popup
        }
    },
}
</script>
