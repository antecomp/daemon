// This function checks if two numbers are close to each other within a specified threshold.
// It is useful for comparing floating-point numbers where precision errors may occur.
export function isCloseTo(a: number, b: number, threshold: number = 0.01): boolean {
    return Math.abs(a - b) < threshold;
}