import type { OverlayTemplate } from "klinecharts";

const pendingLine: OverlayTemplate = {
    name: "pendingLine",
    totalStep: 1,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    zLevel: 100,
    createPointFigures: ({ bounding, coordinates }) => {
        const y = coordinates[0]!.y;
        return [
            {
                type: "line",
                attrs: {
                    coordinates: [
                        { x: 0, y },
                        { x: bounding.width, y }
                    ]
                }
            }
        ];
    }
};

export default pendingLine;