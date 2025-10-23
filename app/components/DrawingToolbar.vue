<template>
    <div class="flex flex-col gap-2 -order-1 p-2 border-r border-r-muted">
        <UButton
            v-for="(item, index) in overlays"
            :key="index"
            :icon="item.icon"
            :variant="drawingOverlayName === item.name ? 'soft' : 'ghost'"
            :color="drawingOverlayName === item.name ? 'primary' : 'neutral'"
            square
            @click="addOverlay(item.name)"
        />
        <USeparator/>
        <UTooltip
            :delay-duration="0"
            arrow
            :content="{ side: 'right', align: 'start' }"
            :ui="{ content: 'h-auto flex-col' }"
        >
            <UButton
                icon="i-lucide-magnet"
                :variant="mode === 'normal' ? 'ghost' : 'soft'"
                :color="mode === 'normal' ? 'neutral' : 'primary'"
                square
                @click="clickMode"
            />
            <template #content>
                <UButton
                    v-for="(subMode, index) in subModes"
                    :key="index"
                    icon="i-lucide-magnet"
                    :variant="mode === subMode.value ? 'soft' : 'ghost'"
                    :color="mode === subMode.value ? 'primary' : 'neutral'"
                    :label="subMode.label"
                    :ui="{ base: 'w-full' }"
                    @click="selectSubMode(subMode.value)"
                />
            </template>
        </UTooltip>
        <UButton
            :icon="lock ? 'i-lucide-lock' : 'i-lucide-lock-open'"
            :variant="lock ? 'soft' : 'ghost'"
            :color="lock ? 'primary' : 'neutral'"
            square
            @click="toggleLock"
        />
        <UButton
            :icon="visible ? 'i-lucide-eye' : 'i-lucide-eye-off'"
            :variant="visible ? 'ghost' : 'soft'"
            :color="visible ? 'neutral' : 'primary'"
            square
            @click="toggleVisibility"
        />
        <USeparator/>
        <UButton
            icon="i-lucide-trash"
            variant="ghost"
            color="neutral"
            square
            @click="removeOverlay"
        />
    </div>
</template>

<script lang="ts" setup>
    import type { OverlayMode, OverlayEvent } from "klinecharts";

    const kline = useKlineStore();

    const mode = ref<string>("normal");
    const lock = ref<boolean>(false);
    const visible = ref<boolean>(true);
    const selectedOverlayId = ref<string | null>(null);
    const drawingOverlayName = ref<string | null>(null);

    const overlays = reactive([
        { name: "segment", icon: "i-custom-trendline" },
        { name: "horizontalStraightLine", icon: "i-custom-horizontal-line" },
        { name: "verticalStraightLine", icon: "i-custom-vertical-line" },
        { name: "horizontalRayLine", icon: "i-custom-horizontal-ray" },
        { name: "fibonacciLine", icon: "i-custom-fibonacci-lines" },
        { name: "circle", icon: "i-custom-circle" },
        { name: "rect", icon: "i-custom-rectangle" }
    ]);

    const subModes = reactive([
        { value: "weak_magnet", label: "Weak Magnet" },
        { value: "strong_magnet", label: "Strong Magnet" }
    ]);

    function addOverlay(name: string) {
        if (!kline.chart) return;

        kline.chart.createOverlay({
            name: name,
            visible: visible.value,
            lock: lock.value,
            mode: mode.value as OverlayMode,
            onDrawStart: (event: OverlayEvent<any>) => {
                drawingOverlayName.value = event.overlay.name;
                return true;
            },
            onDrawEnd: () => {
                drawingOverlayName.value = null
                return true;
            },
            onSelected: (event: OverlayEvent<any>) => {
                selectedOverlayId.value = event.overlay.id;
                return true;
            },
            onDeselected: () => {
                selectedOverlayId.value = null;
                return true;
            }
        });
    }

    function clickMode() {
        if (mode.value !== "normal") {
            mode.value = "normal";
        } else {
            mode.value = "weak_magnet";
        }
        kline.chart?.overrideOverlay({ mode: mode.value as OverlayMode });
    }

    function selectSubMode(value: string) {
        mode.value = value;
        kline.chart?.overrideOverlay({ mode: value as OverlayMode });
    }

    function toggleLock() {
        lock.value = !lock.value;
        kline.chart?.overrideOverlay({ lock: lock.value });
    }

    function toggleVisibility() {
        visible.value = !visible.value;
        kline.chart?.overrideOverlay({ visible: visible.value });
    }

    function removeOverlay() {
        if (selectedOverlayId.value) {
            kline.chart?.removeOverlay({ id: selectedOverlayId.value });
        }
    }
</script>