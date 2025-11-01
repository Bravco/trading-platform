import type { OverlayTemplate } from "klinecharts";

const orderLine: OverlayTemplate = {
    name: "orderLine",
    totalStep: 0,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    zLevel: 100,
    createPointFigures: ({ overlay, bounding, yAxis }) => {
        const { price, direction } = overlay.extendData;

        const y = yAxis?.convertToPixel(price);
        const color = direction === "buy" ? "#2DC08E" : "#F92855";

        return [
            {
                type: "line",
                ignoreEvent: true,
                attrs: {
                    coordinates: [
                        { x: 0, y },
                        { x: bounding.width, y }
                    ]
                },
                styles: { color }
            }
        ];
    }
};

export default orderLine;