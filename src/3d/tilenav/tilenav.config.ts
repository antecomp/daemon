export const WINDOW_SIZE_TILES = 11; // centered + 5 on either side.
export const WINDOW_HALF_SIZE_TILES = Math.trunc(WINDOW_SIZE_TILES / 2);

// Negative z is "up" away from the camera, x is typical left/right
export const GRID_COORDS: [number, number][] = (() => {
    const coords: [number, number][] = [];
    for (let z = -WINDOW_HALF_SIZE_TILES; z <= WINDOW_HALF_SIZE_TILES; z++) {
        for (let x = -WINDOW_HALF_SIZE_TILES; x <= WINDOW_HALF_SIZE_TILES; x++) {
            coords.push([x, z]);
        }
    }
    return coords;
})();