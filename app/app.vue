<template>
    <div>
        <NuxtRouteAnnouncer/>
        <UApp>
            <div class="min-h-svh fixed inset-0 p-4 bg-muted">
                <SplitterGroup direction="vertical">
                    <SplitterPanel>
                        <SplitterGroup direction="horizontal">
                            <SplitterPanel :default-size="75" class="bg-default border border-muted rounded-lg">
                                <Chart/>
                            </SplitterPanel>
                            <SplitterResizeHandle class="grid place-items-center">
                                <UIcon name="i-lucide-grip-vertical"/>
                            </SplitterResizeHandle>
                            <SplitterPanel class="bg-default border border-muted rounded-lg">
                                <Watchlist/>
                            </SplitterPanel>
                        </SplitterGroup>
                    </SplitterPanel>
                    <SplitterResizeHandle class="grid place-items-center">
                        <UIcon name="i-lucide-grip-horizontal"/>
                    </SplitterResizeHandle>
                    <SplitterPanel :default-size="25" class="flex bg-default p-2 border border-muted rounded-lg">
                        <Positions/>
                    </SplitterPanel>
                </SplitterGroup>
            </div>
        </UApp>
    </div>
</template>

<script setup lang="ts">
    import { registerOverlay } from "klinecharts";

    const overlays = useOverlays();
    
    overlays.forEach(overlay => registerOverlay(overlay));
</script>