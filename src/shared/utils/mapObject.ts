export function mapObject<T, O>(obj: Record<string, T>, fn: (v: T, k: string, obj: Record<string, T>) => O) {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, fn(v, k, obj)])
  );
}