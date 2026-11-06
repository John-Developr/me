/* ============================================================
   CHART SCALE (line chart geometry)
   ------------------------------------------------------------
   Pure helpers so the SVG component only draws. Values map to
   a 0-based y axis with a "nice" rounded maximum.
   ============================================================ */

export interface ChartBox {
  width:  number;
  height: number;
  top:    number;
  right:  number;
  bottom: number;
  left:   number;
}

export interface ChartPoint {
  x:     number;
  y:     number;
  value: number;
}

/** Rounds a maximum up to 1, 2, 2.5 or 5 × 10ⁿ so gridlines land on round numbers. */
export function niceMax(value: number): number {
  if (value <= 0) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps     = [1, 2, 2.5, 5, 10];
  const step      = steps.find((s) => s * magnitude >= value) ?? 10;

  return step * magnitude;
}

/** Evenly spaced tick values from 0 to `max` (inclusive), whole numbers only when possible. */
export function yTicks(max: number, count = 4): number[] {
  const step  = max / count;
  const ticks = Array.from({ length: count + 1 }, (_, i) => i * step);

  return Number.isInteger(step) ? ticks : ticks.map((t) => Math.round(t * 100) / 100);
}

/** Maps values to SVG coordinates inside the plot area of `box`. */
export function toChartPoints(values: number[], max: number, box: ChartBox): ChartPoint[] {
  const plotWidth  = box.width  - box.left - box.right;
  const plotHeight = box.height - box.top  - box.bottom;
  const lastIndex  = Math.max(values.length - 1, 1);

  return values.map((value, i) => ({
    x: box.left + (values.length === 1 ? plotWidth / 2 : (i / lastIndex) * plotWidth),
    y: box.top + plotHeight - (Math.max(value, 0) / max) * plotHeight,
    value,
  }));
}

/** SVG path "d" for a polyline through the points. */
export function linePath(points: ChartPoint[]): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");
}

/** Index of the point nearest to an x coordinate (for hover tooltips). */
export function nearestIndex(points: ChartPoint[], x: number): number {
  let best = 0;

  for (let i = 1; i < points.length; i++) {
    if (Math.abs(points[i].x - x) < Math.abs(points[best].x - x)) best = i;
  }

  return best;
}

/** Up to `max` evenly spaced indexes for x-axis labels, always including the last one. */
export function labelIndexes(length: number, max = 6): number[] {
  if (length <= max) return Array.from({ length }, (_, i) => i);

  const step    = (length - 1) / (max - 1);
  const indexes = Array.from({ length: max }, (_, i) => Math.round(i * step));

  return [...new Set(indexes)];
}
