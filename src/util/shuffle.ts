export function shuffleArrayInPlace<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
      // Pick a random index from 0 to i (inclusive)
      const j = Math.floor(Math.random() * (i + 1));
  
      // Swap elements at i and j
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function shuffleArray<T>(array: T[]) {
    let arr = [...array];

    for(let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    return arr;
}