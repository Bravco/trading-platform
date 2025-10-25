<template>
    <UModal
        v-model:open="modal"
        title="Indicator Settings"
        :description="indicator?.name ?? ''"
    >
        <template #body>
            <UForm v-if="state.length" @submit="onSubmit" class="flex flex-col gap-4">
                <UFormField
                    v-for="(_, i) in state"
                    :key="i"
                    :label="state[i].key"
                    :name="state[i].key"
                >
                    <UInput
                        v-model="state[i].value"
                        type="number"
                        min="1"
                        max="1000"
                        class="w-full"
                    />
                </UFormField>
                <UButton type="submit" label="Confirm" class="ml-auto"/>
            </UForm>
            <span v-else>No editable parameters</span>
        </template>
    </UModal>
</template>

<script lang="ts" setup>
    import type { Nullable, Indicator } from "klinecharts";
    
    const kline = useKlineStore();

    const modal = ref<boolean>(false);
    const indicator = ref<Nullable<Indicator>>(null);
    const state = reactive<any[]>([]);

    watch(() => kline.editedIndicator, (value) => {
        if (!kline.chart) return;

        if (value) {
            modal.value = true;
            indicator.value = kline.chart.getIndicatorByPaneId(value.paneId, value.name) as Indicator;
            state.splice(0, state.length);
            state.push(...indicator.value.calcParams.map((param, i) => ({
                key: indicator.value?.figures[i]?.key,
                value: param
            })));
        }
    });

    function onSubmit() {
        modal.value = false;

        if (!kline.chart || !kline.editedIndicator) return;
        kline.chart.overrideIndicator(
            { name: kline.editedIndicator.name, calcParams: state.map(f => f.value) },
            kline.editedIndicator.paneId
        );
    }
</script>