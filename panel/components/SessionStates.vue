<template>
    <v-list v-if="listMode">
        <v-list-item v-if="session?.account">
            <template #prepend>
                <v-avatar size="32">
                    <v-img v-if="session?.account?.image" :src="session.account.image"></v-img>
                    <v-icon v-else size="32" icon="account_circle" />
                </v-avatar>
            </template>
            <v-list-item-title>Whatsapp Account</v-list-item-title>
            <v-list-item-subtitle>
                {{ session?.account.user }} &mdash; {{ session?.account.name }}
            </v-list-item-subtitle>
        </v-list-item>

        <v-list-item v-if="session?.lastWaWebVersion">
            <template #prepend>
                <v-avatar size="32"><v-icon size="32" icon="account_circle" /></v-avatar>
            </template>
            <v-list-item-title>Whatsapp Web Version</v-list-item-title>
            <v-list-item-subtitle>
                v{{ session?.lastWaWebVersion }}
            </v-list-item-subtitle>
        </v-list-item>

        <v-list-item title="Remote Session" :subtitle="SessionStateMap[session.state.value][0]">
            <template #prepend>
                <v-avatar size="32"><v-icon size="32" :icon="SessionStateMap[session.state.value][1]"
                        :color="SessionStateMap[session.state.value][2]" /></v-avatar>
            </template>
        </v-list-item>
        <v-list-item title="Whatsapp Web Socket" :subtitle="WaSocketStateMap[session.waState.value?.state][0]">
            <template #prepend>
                <v-avatar size="32"><v-icon size="32" :icon="WaSocketStateMap[session.waState.value?.state][1]"
                        :color="WaSocketStateMap[session.waState.value?.state][2]" /></v-avatar>
            </template>
        </v-list-item>
        <v-list-item title="Whatsapp Web Stream" :subtitle="WaStreamStateMap[session.waState.value?.stream][0]">
            <template #prepend>
                <v-avatar size="32">
                    <v-icon size="32" :icon="WaStreamStateMap[session.waState.value?.stream][1]"
                        :color="WaStreamStateMap[session.waState.value?.stream][2]" />
                </v-avatar>
            </template>
        </v-list-item>
    </v-list>
    <template v-else>
        <div class="d-flex ga-1 align-center">
            <template v-if="showAll">
                <v-chip color="primary" v-if="session.waState.value.unread !== null" size="small">
                    {{ session.waState.value.unread }} unread
                </v-chip>
                <v-avatar color="grey-lighten-1" size="24" class="ml-2 mr-1">
                    <v-img v-if="session?.account?.image" :src="session?.account.image"></v-img>
                    <v-icon v-else icon="person" />
                </v-avatar>
                <template v-if="session?.account">
                    <v-chip size="small">{{ session?.account.user }}</v-chip>
                    <v-chip size="small">{{ session?.account.name }}</v-chip>
                </template>
            </template>
            <v-chip :color="SessionStateMap[session.state.value][2]" size="small">
                <v-icon start :icon="SessionStateMap[session.state.value][1]" size="18" />
                State: {{ SessionStateMap[session.state.value][0] }}
            </v-chip>
            <v-chip :color="WaSocketStateMap[session.waState.value.state][2]" size="small">
                <v-icon start :icon="WaSocketStateMap[session.waState.value.state][1]" size="18" />
                Socket: {{ WaSocketStateMap[session.waState.value.state][0] }}
            </v-chip>
            <v-chip :color="WaStreamStateMap[session.waState.value.stream][2]" size="small">
                <v-icon start :icon="WaStreamStateMap[session.waState.value.stream][1]" size="18" />
                Stream: {{ WaStreamStateMap[session.waState.value.stream][0] }}
            </v-chip>
        </div>
    </template>
</template>
<script setup lang="ts">
import { WaSocketStateMap, SessionStateMap, WaStreamStateMap } from '../libs/label-icon-color';
import type { SessionItem } from '../uses/sessions';
const { session, listMode, showAll } = defineProps<{ session: SessionItem, listMode?: boolean, showAll?: boolean }>()

</script>