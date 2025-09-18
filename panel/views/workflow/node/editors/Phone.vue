<script setup lang="ts">
import type { ConfigItem } from '@src/types/action-types';
import { computed, ref, watch } from 'vue'

/**
 * Props:
 *  - modelValue: string (the phone text the user types)
 *  - countryCode: string ("62" by default, can be changed to your desired default)
 */
const props = withDefaults(defineProps<{
    modelValue: string | null,
    countryCode?: string,
    config?: ConfigItem
}>(), {
    modelValue: '',
    countryCode: '62'
})

const emit = defineEmits(['update:modelValue', 'update:waId', 'copied'])

// local mirror of the input
const phoneInput = ref(props.modelValue)
// watch(() => props.modelValue, v => (phoneInput.value = v))

/**
 * Normalize to digits then to intl-like format:
 * - remove everything except [0-9]
 * - if starts with "00" -> replace with "+"
 * - if starts with "0"  -> replace leading "0" with default countryCode
 * - if starts with "+"  -> drop "+" (we want digits only for WA)
 * - if starts with countryCode already -> keep
 */
function normalizeToDigits(raw, cc) {
    const digits = (raw ?? '').replace(/[^\d+]/g, '')
    if (!digits) return ''

    // Convert leading 00 to +
    let s = digits.replace(/^00+/, '+')

    // Remove all non-digits except a leading +
    // (after this line, s contains only digits and maybe a leading +)
    s = s.replace(/(?!^)\D/g, '')

    if (s.startsWith('+')) s = s.slice(1)

    if (s.startsWith(cc)) {
        return s
    }

    // If it starts with 0 (e.g., 0812...), turn into cc + rest
    if (/^0\d+/.test(s)) {
        return cc + s.slice(1)
    }

    // If it’s already plain digits but without cc, assume local → prepend cc
    // (you can relax this if you want to require explicit +)
    if (/^\d+$/.test(s)) {
        return cc + s
    }

    return s
}

const error = ref(false)
// Two-way binding outward
watch(phoneInput, (v) => {

    if (!v || v.length < 5) return error.value = true

    error.value = false
    const formated = normalizeToDigits(v, props.countryCode)
    emit('update:modelValue', `${formated}@c.us`)
})
</script>

<template>
    <v-text-field :error="error" v-model="phoneInput" placeholder="+62 812-3456-7890 or 0812…" clearable
        prepend-inner-icon="phone" autocomplete="tel" inputmode="tel" />
</template>
