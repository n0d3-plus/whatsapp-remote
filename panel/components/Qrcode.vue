<template>
    <div ref="canvas"></div>
</template>

<script setup lang="ts">

import { onMounted, ref, watch } from "vue";
import QRCode from "../libs/qrcode"

let instance: QRCode

const props = defineProps<{ code?: string }>()
const canvas = ref<HTMLCanvasElement>()

watch(props, () => {
    instance.clear()
    if (props.code) {
        instance.makeCode(props.code)
    }
})

onMounted(() => {
    instance = new QRCode(canvas.value as HTMLElement,{
        correctLevel: QRCode.CorrectLevel.L
    })
    if (props.code) {
        instance.makeCode(props.code)
    }
})
</script>