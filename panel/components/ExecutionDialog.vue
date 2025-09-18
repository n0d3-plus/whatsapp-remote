<template>
    <v-dialog v-model="dialog" max-width="900" scrollable>
        <v-card density="compact">
            <v-card-title class="d-flex justify-space-between align-center">
                Execution Details
                <v-btn icon="close" density="compact" variant="text" @click="dialog = false" />
            </v-card-title>

            <v-divider />

            <!-- Content -->
            <v-card-text v-if="execution">
                <v-row no-gutters class="mb-1">
                    <v-col sm="3" md="2" cols="12" class="text-grey text-subtitle-2">ID</v-col>
                    <v-col sm="9" md="10" cols="12"><code>{{ execution.pid }}.{{ execution.id }}.{{ execution.node.id
                    }}</code></v-col>
                </v-row>
                <v-row no-gutters class="mb-1">
                    <v-col sm="3" md="2" cols="12" class="text-grey text-subtitle-2">Chains</v-col>
                    <v-col sm="9" md="10" cols="12">{{ execution.chains.join(", ") }}</v-col>
                </v-row>
                <v-row no-gutters class="mb-1">
                    <v-col sm="3" md="2" cols="12" class="text-grey text-subtitle-2">Elapsed</v-col>
                    <v-col sm="9" md="10" cols="12"><code>{{
                        execution.end ? `${(execution.end - execution.start).toFixed(2)} ms` : 'Not Finished'
                    }}</code></v-col>
                </v-row>

                <!-- Error block -->
                <v-row v-if="execution.error">
                    <v-col sm="3" md="2" cols="12" class="text-grey text-subtitle-2">Error</v-col>
                    <v-col sm="9" md="10" cols="12" class="text-red" style="overflow: auto;">
                        <template v-if="execution.error.stack">
                            <strong>{{ execution.error.message }}</strong>
                            <pre>{{ execution.error.stack }}</pre>
                        </template>
                        <template v-else>
                            <strong>{{ execution.error.$ERR }}:</strong>
                            {{ execution.error.message }}
                        </template>
                    </v-col>
                </v-row>

                <v-row no-gutters class="mb-1">
                    <v-col sm="3" md="2" cols="12" class="text-grey text-subtitle-2">Configs</v-col>
                    <v-col sm="9" md="10" cols="12" style="overflow: auto;">
                        <pre>{{ JSON.stringify(execution.configs, null, 2) }}</pre>
                    </v-col>
                </v-row>


                <!-- <v-row no-gutters class="mb-1">
                    <v-col sm="3" md="2" cols="12" class="text-grey text-subtitle-2">Target Handle</v-col>
                    <v-col sm="9" md="10" cols="12">{{ execution.targetHandle }}</v-col>
                </v-row> -->

                <v-row no-gutters class="mb-1">
                    <v-col sm="3" md="2" cols="12" class="text-grey text-subtitle-2">Consumes</v-col>
                    <v-col sm="9" md="10" cols="12" style="overflow: auto;">
                        <pre>{{ JSON.stringify(execution.consumes, null, 2) }}</pre>
                    </v-col>
                </v-row>

                <v-row no-gutters class="mb-1" v-if="execution.produces">
                    <v-col sm="3" md="2" cols="12" class="text-grey text-subtitle-2">Produces</v-col>
                    <v-col sm="9" md="10" cols="12" style="overflow: auto;">
                        <pre>{{ JSON.stringify(execution.produces, null, 2) }}</pre>
                    </v-col>
                </v-row>

            </v-card-text>

            <v-divider />

            <!-- Actions -->
            <!-- <v-card-actions>
                <v-spacer />
                <v-btn color="primary" @click="dialog = false">Close</v-btn>
            </v-card-actions> -->
        </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import type { Execution } from '@src/types/worker-types';
import { ref } from 'vue';

// State
const dialog = ref(false)
const execution = ref<Execution | null>(null)

// Show function for parent
function show(data: Execution) {
    execution.value = data
    dialog.value = true
}

// Expose show() for parent
defineExpose({ show })
</script>