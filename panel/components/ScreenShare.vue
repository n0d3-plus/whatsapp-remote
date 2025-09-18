<template>
    <canvas @contextmenu.prevent="false" ref="canvas" style="max-width: 100%; max-height: 90vh;" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useWsApi, type WsApi } from '../uses/ws-api'
import { useSessions } from '../uses/sessions';

const canvas = ref<HTMLCanvasElement | null>(null)
const { ws } = useWsApi()
const { sessionId } = defineProps<{ sessionId: number | null }>()
const sessions = useSessions()

let frameBuffer: ImageBitmap | null = null
let rafId: number | null = null
function drawLoop(ctx: CanvasRenderingContext2D) {
    if (frameBuffer) {
        ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height)
        ctx.drawImage(frameBuffer, 0, 0, canvas.value!.width, canvas.value!.height)
    }
    rafId = requestAnimationFrame(() => drawLoop(ctx))
}

let canvasSet
async function setupCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
    // const session = sessions.value.get(sessionId!)
    // if (!session) return console.warn('setupCanvas no session')

    // const vp = session.waState.value?.viewport || { width: w || 800, height: h || 600, pixelRatio: 1 }
    const vp = { width: w || 800, height: h || 600, pixelRatio: 1 }
    // if (!vp.width || !vp.height) return console.warn('setupCanvas no width')

    canvas.width = vp.width / vp.pixelRatio
    canvas.height = vp.height / vp.pixelRatio
    canvasSet = true
    console.debug('canvas', vp, { width: canvas.width, height: canvas.height })

    await nextTick()
    const scaleX = vp.width / canvas.clientWidth
    const scaleY = vp.height / canvas.clientHeight

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas!.getBoundingClientRect()
        const x = (e.clientX - rect.left) * scaleX
        const y = (e.clientY - rect.top) * scaleY
        const msg = `@D${x},${y},${e.button}`
        // console.log(msg)
        ws.send(msg)
    })
    canvas.addEventListener('mouseup', (e) => {
        const rect = canvas!.getBoundingClientRect()
        // const x = (e.clientX - rect.left) * vp.pixelRatio
        // const y = (e.clientY - rect.top) * vp.pixelRatio
        const x = (e.clientX - rect.left) * scaleX
        const y = (e.clientY - rect.top) * scaleY
        const msg = `@U${x},${y},${e.button}`
        // console.log(msg)
        ws.send(msg)
    })
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault()
        // console.log(`Whe ${e.deltaX},${e.deltaY}]`)
        ws.send(`@S${e.deltaX},${e.deltaY}`)
    }, { passive: false })
}

onMounted(() => {
    if (sessionId && canvas.value) {
        const ctx = canvas.value.getContext('2d')
        if (!ctx) return console.warn(`!ctx`)
        if (!sessions.value.has(sessionId!)) return console.warn(`!session`)
        // setupCanvas(canvas.value)

        // set initial size (you can dynamically resize too)
        // canvas.value.width = 1280
        // canvas.value.height = 720

        ws.send(`["remote-start", ${sessionId}]`)
        ws.onBlob = async (blob) => {
            const bitmap = await createImageBitmap(blob)
            frameBuffer = bitmap
            // console.debug({ width: bitmap.width, height: bitmap.height })
            if (!canvasSet && canvas.value) {
                setupCanvas(canvas.value, bitmap.width, bitmap.height)
            }
        }
        drawLoop(ctx)
    }
})

onBeforeUnmount(() => {
    if (sessionId) {
        ws.send(`["remote-stop", ${sessionId}]`)
        ws.onBlob = undefined
        frameBuffer = null
        if (rafId !== null) cancelAnimationFrame(rafId)
    }
})
</script>
