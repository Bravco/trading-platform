import type { Coordinate } from "klinecharts";

export default function (coordinate1: Coordinate, coordinate2: Coordinate): number {
    const xDis = Math.abs(coordinate1.x - coordinate2.x);
    const yDis = Math.abs(coordinate1.y - coordinate2.y);
    return Math.sqrt(xDis * xDis + yDis * yDis);
}