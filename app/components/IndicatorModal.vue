<template>
    <UModal
        v-model:open="modal"
        title="Indicator"
        :description="`Count: ${0}`"
    >
        <UButton
            icon="i-lucide-square-function"
            label="Indicator"
            variant="ghost"
            color="neutral"
        />
        <template #body>

        </template>
    </UModal>
</template>

<script setup lang="ts">
    const modal = ref<boolean>(false);
</script>