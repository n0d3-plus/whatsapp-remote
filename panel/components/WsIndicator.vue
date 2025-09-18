<template>
    <v-btn @click="popup(`Server connection: ${stateLabel}`, color)" icon :color="color" size="32" :title="stateLabel">
        <v-icon :icon="stateIcons" class="mx-auto" v-bind="$attrs" />
    </v-btn>
</template>

<script setup lang="ts">
import { computed, type Ref } from 'vue'
import { WsState } from '../uses/ws-api'
import { popup } from './Popups.vue'
defineOptions({
    inheritAttrs: false
})

const { state } = defineProps<{state: Ref<WsState>}>()

const color = computed(() => {
    switch (state.value) {
        case WsState.connected: return 'success'
        case WsState.connecting: return 'warning'
        case WsState.disconnected:
            return 'error'
        default: return 'info'
    }
})

const stateLabel = computed(() => {
    switch (state.value) {
        case WsState.connected: return 'Connected'
        case WsState.connecting: return 'Connecting'
        case WsState.disconnected: return 'Disconnected'
        default: return 'Unknown'
    }
})
const stateIcons = computed(() => {
    switch (state.value) {
        case WsState.disconnected:
            return 'cancel'
        case WsState.connecting:
            return 'restart_alt'
        case WsState.connected:
            return 'adjust'
        default:
            return 'help'
    }
})
</script>
