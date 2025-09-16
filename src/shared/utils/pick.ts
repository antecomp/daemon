/**
 * Creates a new object by picking a subset of properties from the given object.
 *
 * @template T The type of the source object.
 * @template K The keys to pick from the source object.
 * @param {T} obj - The source object to pick properties from.
 * @param {K[]} keys - An array of keys to extract from the source object.
 * @returns {Pick<T, K>} A new object containing only the specified keys.
 */
export default function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
        result[key] = obj[key];
    }
    return result;
}