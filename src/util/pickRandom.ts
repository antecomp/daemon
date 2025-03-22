export default function pickRandom<T>(items: T[]): T {
	return items[Math.floor(Math.random() * items.length)];
}

export function pickRandomWeighted<T>(items: T[], weights: number[]): T {
	const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        if (r < weights[i]) return items[i];
        r -= weights[i];
    }
    return items[items.length - 1]; // fallback
}