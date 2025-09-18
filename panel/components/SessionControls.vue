<script setup lang="ts">
import { ref, shallowRef, nextTick } from 'vue';
import { SessionState } from '../../src/types';
import Qrcode from '../components/Qrcode.vue';
import { type SessionItem } from '../uses/sessions';
import ScreenShare from '../components/ScreenShare.vue';
import ConfigForm from '../components/ConfigForm.vue';
import { popup } from './Popups.vue';
import { useRouter } from 'vue-router';

const { session: item, listMode, showAll } = defineProps<{ session: SessionItem, listMode?: boolean, showAll?: boolean }>()

const showScreenShare = ref(false)
const showQRCode = ref(false)
const configForm = shallowRef<InstanceType<typeof ConfigForm>>()
const router = useRouter()

function onStart(item: SessionItem) {
    item.state.value = SessionState.starting
    fetch(`/start/${item.id}`)
        .then(res => {
            if (!res.ok) {
                res.json().then(body => {
                    nextTick(() => item.state.value = SessionState.stopped)
                    console.log(body)
                    popup(body.error || body, 'error')
                })
            }
        })
}

function onStop(item: SessionItem) {
    item.state.value = SessionState.starting
    fetch(`/stop/${item.id}`)
}

function forceReset(item: SessionItem) {
    item.state.value = SessionState.starting
    fetch(`/reset-state/${item.id}`).then(() => popup('OK'))
}

function onDelete(item: SessionItem) {
    if (!confirm(`Are you sure to delete "${item.name}"`))
        return
    fetch(`/delete/${item.id}`, { method: 'DELETE' }).then(
        () => router.replace('/')
    )
}

function onLoginWithPhone(item: SessionItem) {
    let phone = prompt("Phone Number:")
    if (!phone) return
    phone = phone.replace(/\W/g, '').replace(/^0/, '62')
    fetch(`/link/${item.id}/${phone}`)
}

function onScreenShare(_item: SessionItem) {
    showScreenShare.value = true
}

function onShowQRCode(_item: SessionItem) {
    showQRCode.value = true
}
</script>

<template>
    <v-list v-if="listMode">
        <slot></slot>
        <v-list-item density="compact" v-if="session.state.value <= SessionState.stopped"
            @click.stop.prevent="onStart(session)" class="text-green" prepend-icon="play_arrow" title="Start Session">
        </v-list-item>
        <v-list-item density="compact" v-else @click.stop.prevent="onStop(session)" class="text-red"
            prepend-icon="block" title="Stop Session"></v-list-item>
        <template v-if="session.state.value == SessionState.need_auth">
            <v-list-item density="compact" class="text-amber" @click.stop.prevent="onShowQRCode(session)"
                title="Show QR Code for Login" prepend-icon="qr_code_scanner"></v-list-item>
            <v-list-item density="compact" class="text-amber" @click.stop.prevent="onLoginWithPhone(session)"
                title="Login with Phone Number" prepend-icon="mobile_lock_portrait"></v-list-item>
        </template>
        <v-list-item density="compact" v-if="session.state.value >= SessionState.starting"
            @click.stop.prevent="onScreenShare(session)" class="text-primary" title="Screen share"
            prepend-icon="screen_share"></v-list-item>
        <v-list-item density="compact" class="text-primary" @click="configForm?.show(session)" prepend-icon="settings"
            title="Configuration" />
        <v-list-item density="compact" class="text-red" @click="forceReset(session)" prepend-icon="close"
            title="Force Stop" />
        <v-list-item density="compact" class="text-error" @click="onDelete(session)" prepend-icon="delete"
            title="Delete Session" />
    </v-list>

    <template v-else>
        <template v-if="session.state.value == SessionState.need_auth">
            <v-btn color="success" variant="text" @click.stop.prevent="onShowQRCode(session)"
                title="Show QR Code for Login" icon="qr_code_scanner"></v-btn>
            <v-btn color="success" variant="text" @click.stop.prevent="onLoginWithPhone(session)"
                title="Login with Phone Number" icon="mobile_lock_portrait"></v-btn>
        </template>
        <v-btn v-if="session.state.value >= SessionState.starting" @click.stop.prevent="onScreenShare(session)"
            color="primary" title="Screen share" icon="screen_share" variant="text"></v-btn>
        <v-btn v-if="session.state.value <= SessionState.stopped" @click.stop.prevent="onStart(session)" color="green"
            icon="play_arrow" variant="text">
        </v-btn>
        <v-btn v-else @click.stop.prevent="onStop(session)" color="red" icon="block" variant="text"></v-btn>
        <v-btn class="text-primary" @click.stop.prevent="configForm?.show(session)" variant="text" icon="settings"
            title="Config" />

        <template v-if="showAll">
            <v-btn class="text-red" @click="onDelete(session)" icon="delete" title="Delete" />
        </template>

        <v-menu v-else offset-y>
            <template #activator="{ props }">
                <v-btn @click.stop.prevent="props.onClick" @keydown.stop.prevent="props.onKeydown" variant="text"
                    icon="more_vert" />
            </template>
            <v-list>
                <v-list-item class="text-warning" @click="forceReset(session)" prepend-icon="close"
                    title="Force Stop" />
                <v-list-item class="text-red" @click="onDelete(session)" prepend-icon="delete" title="Delete Session" />
            </v-list>
        </v-menu>
    </template>


    <v-dialog v-model="showScreenShare" :max-width="800">
        <v-card>
            <v-card-text class="d-flex justify-center">
                <ScreenShare :session-id="item?.id!" />
            </v-card-text>
        </v-card>
    </v-dialog>
    <v-dialog v-model="showQRCode" width="auto" :opacity="0.8" theme="light">
        <VCard>
            <VCardText>
                <Qrcode v-if="item?.waState.value.qrcode" :code="item?.waState.value.qrcode!" />
            </VCardText>
        </VCard>
    </v-dialog>
    <ConfigForm ref="configForm" />

</template>
