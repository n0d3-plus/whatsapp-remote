<template>
    <v-dialog max-width="800" min-height="500" persistent scrollable>
        <template v-slot:activator="{ props: activatorProps }">
            <v-btn v-bind="activatorProps" prepend-icon="edit" block size="small" variant="outlined" text="Edit Code"></v-btn>
        </template>

        <template v-slot:default="{ isActive }">
            <v-card :loading="loading">
                <!-- <VCardTitle>
                </VCardTitle> -->
                <template #title>
                    <v-btn density="compact" icon="close" class="float-right" variant="text"
                        @click="isActive.value = false"></v-btn>
                    {{ $attrs.label }}
                </template>
                <!-- <v-toolbar density="comfortable">
                </v-toolbar> -->
                <v-card-text class="pa-0 border" style="min-height: 120px;">
                    <div ref="editorEl"></div>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text="Save" @click="onSave(isActive)"></v-btn>
                </v-card-actions>
            </v-card>
        </template>
    </v-dialog>
</template>

<script setup lang="ts">
import { javascript } from "@codemirror/lang-javascript"
import type { ConfigItem, ConfigOption } from "@action-types";
import { EditorView, basicSetup } from "codemirror"
import { nextTick, onUnmounted, ref, shallowRef, watch, type Ref } from 'vue';
import { useTheme } from "vuetify";
defineOptions({ inheritAttrs: false })

const model = defineModel<string>()
const loading = ref(true)
const editorEl = shallowRef<HTMLDivElement>()
const { current } = useTheme()
let editorView: EditorView
let oneDark: typeof import('@codemirror/theme-one-dark').oneDark

defineProps<{
    config: ConfigOption<"CODE">
}>()

watch(editorEl, async (v) => {
    const isVisible = !!v
    if (isVisible) {
        const extensions = [
            basicSetup,
            javascript(),
        ]
        if (current.value.dark) {
            if (!oneDark)
                oneDark = (await import('@codemirror/theme-one-dark')).oneDark
            console.log('od', oneDark)
            extensions.push(oneDark)
        }

        editorView = new EditorView({
            doc: model.value,
            extensions,
            parent: editorEl.value,
        })

        loading.value = false
    } else {
        if (editorView) {
            editorView.destroy()
        }
    }
})

onUnmounted(() => {
    if (editorView) {
        editorView.destroy()
        editorView = null!
    }
})

function onSave(isActive: Ref<boolean>) {

    console.debug(editorView.state.doc.toString())
    const codes = editorView.state.doc.toString()
    model.value = codes
    nextTick(() => isActive.value = false)
}

</script>