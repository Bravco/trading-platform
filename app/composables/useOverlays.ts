import type { OverlayTemplate } from "klinecharts";

const modules = import.meta.glob<OverlayTemplate>("./overlays/*.ts", { eager: true });

export const useOverlays = () => {
    return Object.values(modules).map((m: any) => m.default);
};