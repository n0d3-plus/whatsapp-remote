<template>
    <v-dialog v-model="dialog" max-width="700" scrollable>
        <template v-slot:activator="props">
            <slot name="default" v-bind="props"></slot>
        </template>

        <v-card density="compact" title="Update Event Data">
            <v-card-text>
                <v-textarea hide-details density="compact" v-model="internalModel" variant="outlined" auto-grow />
            </v-card-text>
            <v-divider />
            <v-card-actions>
                <v-btn text @click="loadSample">Load Sample</v-btn>
                <v-spacer></v-spacer>
                <v-btn :disabled="!isChanged" text @click="onSave">OK</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { sampleMessageEvent } from '../../../uses/storage';

import { computed, ref, shallowRef } from 'vue'
const model = defineModel<string>()
const internalModel = ref(model.value || '')
const dialog = shallowRef(false)
const isChanged = computed(() => model.value != internalModel.value)

function loadSample() {
    internalModel.value = JSON.stringify(sampleMessageEvent, null, 2)
}

function onSave() {
    model.value = internalModel.value
    dialog.value = false
}

</script>