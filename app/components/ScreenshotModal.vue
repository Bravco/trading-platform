<template>
    <UModal
        v-model:open="modal"
        title="Screenshot"
        description="Save"
        :ui="{ body: 'space-y-4' }"
    >
        <UButton
            icon="i-lucide-camera"
            variant="ghost"
            color="neutral"
            square
        />
        <template #body>
            <NuxtImg v-if="url" :src="url" alt="screenshot"/>
            <UButton
                label="Download"
                class="my-auto"
                @click="downloadImage"
            />
        </template>
    </UModal>
</template>

<script lang="ts" setup>
    const kline = useKlineStore();

    const modal = ref<boolean>(false);
    const url = ref<string | null>(null);

    watch(modal, (value) => {
        if (!value || !kline.chart) return;
        url.value = kline.chart.getConvertPictureUrl(true, "png");
    });

    function downloadImage() {
        if (!url.value) return;

        const a = document.createElement("a");
        a.href = url.value;
        a.download = `${kline.symbol}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
</script>