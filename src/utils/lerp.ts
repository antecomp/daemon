export default function lerp(start: number, end: number, factor: number) {
    return start + (end - start) * factor;
}

export function lerpBySpeed(start: number, end: number, unitsPerFrame: number): number {
  const distance = Math.abs(end - start);
  if (distance === 0) return end;
  const factor = Math.min(unitsPerFrame / distance, 1);
  return lerp(start, end, factor);
}

// Changes direction of lerp based on whatever rotation is closer.
export function lerpAngle(from: number, to: number, factor: number) {
  let delta = (to - from) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return from + delta * factor;
}