<template>
    <UModal
        v-model:open="modal"
        title="Timezone"
        :description="timezone"
    >
        <UButton
            icon="i-lucide-earth"
            :label="timezone"
            variant="ghost"
            color="neutral"
        />
        <template #body>
            <USelectMenu
                v-model="timezone"
                value-key="value"
                :items="items"
                class="w-full cursor-pointer"
            />
        </template>
    </UModal>
</template>

<script lang="ts" setup>
    import { tz } from "moment-timezone";
    import type { SelectMenuItem } from "@nuxt/ui";

    const kline = useKlineStore();

    const timezones = [
        "UTC",
        "Etc/UTC",
        "Pacific/Honolulu",
        "America/Anchorage",
        "America/Juneau",
        "America/Los_Angeles",
        "America/Phoenix",
        "America/Vancouver",
        "America/Denver",
        "America/Mexico_City",
        "America/El_Salvador",
        "America/Bogota",
        "America/Chicago",
        "America/Lima",
        "America/Caracas",
        "America/New_York",
        "America/Toronto",
        "America/Buenos_Aires",
        "America/Santiago",
        "America/Sao_Paulo",
        "Atlantic/Azores",
        "Atlantic/Reykjavik",
        "Africa/Casablanca",
        "Europe/Dublin",
        "Africa/Lagos",
        "Europe/Lisbon",
        "Europe/London",
        "Africa/Tunis",
        "Europe/Amsterdam",
        "Europe/Belgrade",
        "Europe/Berlin",
        "Europe/Bratislava",
        "Europe/Brussels",
        "Europe/Budapest",
        "Europe/Copenhagen",
        "Africa/Johannesburg",
        "Europe/Luxembourg",
        "Europe/Madrid",
        "Europe/Malta",
        "Europe/Oslo",
        "Europe/Paris",
        "Europe/Prague",
        "Europe/Rome",
        "Europe/Stockholm",
        "Europe/Vienna",
        "Europe/Warsaw",
        "Europe/Zurich",
        "Europe/Athens",
        "Asia/Bahrain",
        "Europe/Bucharest",
        "Africa/Cairo",
        "Europe/Helsinki",
        "Europe/Istanbul",
        "Asia/Jerusalem",
        "Asia/Kuwait",
        "Europe/Moscow",
        "Africa/Nairobi",
        "Asia/Nicosia",
        "Asia/Qatar",
        "Europe/Riga",
        "Asia/Riyadh",
        "Europe/Tallinn",
        "Europe/Vilnius",
        "Asia/Tehran",
        "Asia/Dubai",
        "Asia/Muscat",
        "Asia/Ashgabat",
        "Asia/Karachi",
        "Asia/Colombo",
        "Asia/Kolkata",
        "Asia/Kathmandu",
        "Asia/Dhaka",
        "Asia/Yangon",
        "Asia/Bangkok",
        "Asia/Ho_Chi_Minh",
        "Asia/Jakarta",
        "Asia/Hong_Kong",
        "Asia/Chongqing",
        "Asia/Kuala_Lumpur",
        "Asia/Manila",
        "Australia/Perth",
        "Asia/Shanghai",
        "Asia/Singapore",
        "Asia/Taipei"
    ];

    const modal = ref<boolean>(false);
    const items = ref<SelectMenuItem[]>(
        timezones.map(name => {
            const offsetMinutes = tz(name).utcOffset();
            const hours = Math.floor(Math.abs(offsetMinutes) / 60);
            const minutes = Math.abs(offsetMinutes) % 60;
            const sign = offsetMinutes >= 0 ? "+" : "-";
            const formattedOffset = `UTC${sign}${hours}${minutes ? ":" + String(minutes).padStart(2, "0") : ""}`;
            return {
                label: `${formattedOffset} - ${name}`,
                value: name,
                offset: offsetMinutes
            };
        }).sort((a, b) => a.offset - b.offset)
    );

    const timezone = computed({
        get: () => kline.chart?.getTimezone() ?? "UTC",
        set: (val: string) => {
            if (kline.chart) kline.chart.setTimezone(val);
            modal.value = false;
        }
    });
</script>