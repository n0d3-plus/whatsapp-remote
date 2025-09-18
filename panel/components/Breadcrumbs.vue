<template>
    <VBreadcrumbs active-color="primary" :items="items">
        <template #prepend>
            <VBreadcrumbsItem to="/">
                <VIcon icon="flood" style="font-size: 26px;" />
            </VBreadcrumbsItem>
        </template>
        <template v-slot:divider>
            <v-icon icon="chevron_right" size="small" color="disabled"></v-icon>
        </template>
    </VBreadcrumbs>
</template>
<script setup lang="ts">
import type { BreadcrumbItem } from 'vuetify/lib/components/VBreadcrumbs/VBreadcrumbs.mjs';

defineProps<{ items: BreadcrumbItem[] }>()
</script>