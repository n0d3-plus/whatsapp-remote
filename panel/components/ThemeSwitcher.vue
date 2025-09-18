<script setup lang="ts">
import { ref, watch } from 'vue';
import { useTheme } from 'vuetify';

const { global } = useTheme();
const mode = ref(global.current?.value?.dark ? 'dark' : 'light')
watch(mode, mode => {
    global.name.value = mode;
    localStorage.setItem('mode', mode)
})

function toggleMode() {
    mode.value = mode.value === 'light' ? 'dark' : 'light'
}
</script>
<template>
    <v-btn :icon="`${mode}_mode`" title="Theme mode" slim @click="toggleMode"></v-btn>
</template>