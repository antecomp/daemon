/**
 * Selects a random element from an array of items.
 *
 * @template T - The type of elements in the array.
 * @param items - An array of items to pick a random element from.
 * @returns A randomly selected element from the provided array.
 * @throws Will throw an error if the array is empty.
 */
export default function pickRandom<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

/**
 * Selects a random item from an array based on the provided weights.
 *
 * @template T - The type of the items in the array.
 * @param items - An array of items to choose from.
 * @param weights - An array of weights corresponding to the items. Each weight determines the likelihood of selecting the associated item.
 *                  The length of the `weights` array must match the length of the `items` array.
 * @returns A randomly selected item from the `items` array, weighted by the `weights` array.
 *
 * @throws {Error} If the `weights` array is empty or its length does not match the `items` array.
 */
export function pickRandomWeighted<T>(items: T[], weights: number[]): T {
    if(items.length != weights.length) throw new Error("pickRandomWeighted: items and weights must be of same length");
    
	const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        if (r < weights[i]) return items[i];
        r -= weights[i];
    }
    return items[items.length - 1]; // fallback
}