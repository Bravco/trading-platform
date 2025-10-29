function hexToRgba(hex: string, alpha: number) {
    const [r, g, b] = hex.match(/\w\w/g)!.map((x) => parseInt(x, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixColorWithTransparency(color: string, alpha: number) {
    return color.startsWith("#")
        ? hexToRgba(color, alpha)
        : `color-mix(in oklab, ${color} ${alpha * 100}%, transparent)`;
}

export default function (variable: string, fallback: string = "lightgray", alpha: number = 1): string {
    if (typeof window === "undefined") return fallback;

    const color = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    
    if (!color) return fallback;

    return alpha === 1
        ? color
        : mixColorWithTransparency(color, alpha);
}