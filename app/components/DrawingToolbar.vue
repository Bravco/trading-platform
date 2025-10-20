<template>
    <div class="flex flex-col gap-2 -order-1 p-2 border-r border-r-muted">
        <UButton
            v-for="(item, index) in overlays"
            :key="index"
            :icon="item.icon"
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            @click="addOverlay(item.name)"
        />
        <USeparator/>
        <UTooltip
            :delay-duration="0"
            arrow
            :content="{ side: 'right' }"
            :ui="{ content: 'h-auto flex-col' }"
        >
            <UButton
                icon="i-lucide-magnet"
                :variant="mode === 'normal' ? 'ghost' : 'soft'"
                color="neutral"
                @click="clickMode"
                class="cursor-pointer"
            />
            <template #content>
                <UButton
                    v-for="(subMode, index) in subModes"
                    :key="index"
                    icon="i-lucide-magnet"
                    :variant="mode === subMode.value ? 'soft' : 'ghost'"
                    color="neutral"
                    :label="subMode.label"
                    :ui="{ base: 'w-full' }"
                    class="cursor-pointer"
                    @click="clickSubMode(subMode.value)"
                />
            </template>
        </UTooltip>
        <UButton
            :icon="lock ? 'i-lucide-lock' : 'i-lucide-lock-open'"
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            @click="toggleLock"
        />
        <UButton
            :icon="visible ? 'i-lucide-eye' : 'i-lucide-eye-off'"
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            @click="toggleVisibility"
        />
        <USeparator/>
        <UButton
            icon="i-lucide-trash"
            variant="ghost"
            color="neutral"
            class="cursor-pointer"
            disabled
        />
    </div>
</template>

<script lang="ts" setup>
    import type { OverlayMode } from "klinecharts";

    const kline = useKlineStore();

    const mode = ref<string>("normal");
    const lock = ref<boolean>(false);
    const visible = ref<boolean>(true);

    const overlays = reactive([
        { name: "horizontalStraightLine", icon: "i-lucide-git-commit-horizontal" },
        { name: "verticalStraightLine", icon: "i-lucide-git-commit-vertical" },
        { name: "circle", icon: "i-lucide-circle" },
        { name: "rect", icon: "i-lucide-square" }
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
            mode: mode.value as OverlayMode
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

    function clickSubMode(value: string) {
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
</script>