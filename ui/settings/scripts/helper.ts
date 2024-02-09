/**
 * Limits a value to a range between a minimum and a maximum value.
 * @param min The minimum value.
 * @param max The maximum value.
 * @param value The value to be clamped.
 * @returns
 */
export function clamp(min: number, max: number, value: number): number {
    return Math.max(min, Math.min(max, value));
}
