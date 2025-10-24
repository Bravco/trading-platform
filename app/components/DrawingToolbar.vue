<template>
    <div class="border-r border-r-muted">
        <div class="flex flex-col gap-2 p-2 overflow-y-auto">
            <UTooltip
                v-for="category in overlayCategories"
                :key="category.name"
                :delay-duration="0"
                arrow
                :content="{ side: 'right', align: 'start' }"
                :ui="{ content: 'h-auto flex-col' }"
                :disabled="category.options.length < 2"
            >
                <UButton
                    :icon="category.latest.value.icon"
                    :variant="drawingOverlayKey === category.latest.value.key ? 'soft' : 'ghost'"
                    :color="drawingOverlayKey === category.latest.value.key ? 'primary' : 'neutral'"
                    square
                    @click="addOverlay(category.latest.value)"
                />
                <template #content>
                    <UButton
                        v-for="(option, index) in category.options"
                        :key="index"
                        :icon="option.icon"
                        :label="option.label"
                        :variant="drawingOverlayKey === option.key ? 'soft' : 'ghost'"
                        :color="drawingOverlayKey === option.key ? 'primary' : 'neutral'"
                        square
                        :ui="{ base: 'w-full' }"
                        @click="addOverlay(option)"
                    />
                </template>
            </UTooltip>
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
    </div>
</template>

<script lang="ts" setup>
    import type { OverlayMode, OverlayEvent } from "klinecharts";

    type OverlayOption = {
        key: string,
        icon: string,
        label: string
    }

    type OverlayCategory = {
        name: string,
        options: OverlayOption[],
        latest: Ref<OverlayOption>
    }

    const lineOverlays = <OverlayOption[]>[
        { key: "segment", icon: "i-custom-segment", label: "Segment" },
        { key: "rayLine", icon: "i-custom-ray", label: "Ray" },
        { key: "straightLine", icon: "i-custom-trendline", label: "Trendline" },
        { key: "horizontalStraightLine", icon: "i-custom-horizontal-line", label: "Horizontal Line" },
        { key: "horizontalRayLine", icon: "i-custom-horizontal-ray", label: "Horizontal Ray" },
        { key: "horizontalSegment", icon: "i-custom-horizontal-segment", label: "Horizontal Segment" },
        { key: "verticalStraightLine", icon: "i-custom-vertical-line", label: "Vertical Line" },
        { key: "verticalRayLine", icon: "i-custom-vertical-ray", label: "Verical Ray" },
        { key: "verticalSegment", icon: "i-custom-vertical-segment", label: "Vertical Segment" }
    ];

    const fibonacciOverlays = <OverlayOption[]>[
        { key: "fibonacciLine", icon: "i-custom-fibonacci-lines", label: "Fibonacci Lines" }
    ];

    const shapeOverlays = <OverlayOption[]>[
        { key: "rect", icon: "i-custom-rectangle", label: "Rectangle" },
        { key: "circle", icon: "i-custom-circle", label: "Circle" }
    ];

    const kline = useKlineStore();

    const mode = ref<string>("normal");
    const lock = ref<boolean>(false);
    const visible = ref<boolean>(true);
    const selectedOverlayId = ref<string | null>(null);
    const drawingOverlayKey = ref<string | null>(null);
    const overlayCategories: OverlayCategory[] = [
        {
            name: "line",
            options: lineOverlays,
            latest: ref(lineOverlays[0]!)
        },
        {
            name: "fibonacci",
            options: fibonacciOverlays,
            latest: ref(fibonacciOverlays[0]!)
        },
        {
            name: "shape",
            options: shapeOverlays,
            latest: ref(shapeOverlays[0]!)
        }
    ];

    const subModes = reactive([
        { value: "weak_magnet", label: "Weak Magnet" },
        { value: "strong_magnet", label: "Strong Magnet" }
    ]);

    function addOverlay(option: OverlayOption) {
        if (!kline.chart) return;

        const category = overlayCategories.find(cat => cat.options.includes(option));
        if (category) category.latest.value = option;

        kline.chart.createOverlay({
            name: option.key,
            visible: visible.value,
            lock: lock.value,
            mode: mode.value as OverlayMode,
            onDrawStart: (event: OverlayEvent) => {
                drawingOverlayKey.value = event.overlay.name;
                return true;
            },
            onDrawEnd: () => {
                drawingOverlayKey.value = null
                return true;
            },
            onSelected: (event: OverlayEvent) => {
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