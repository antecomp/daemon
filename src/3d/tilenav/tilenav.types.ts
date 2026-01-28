/** Tile coordinate key formatted as "x,z" in grid space. */
export type NavCoord = `${number},${number}`

export type StepSFXCategory = "carpet" | "dirt" | "floor" | "gravel" | "snow" | "tiles" | "water" | "wood";
export const StepSFXNames = ['carpet', 'dirt', 'floor', 'gravel', 'snow', 'tiles', 'water', 'wood'] as const satisfies StepSFXCategory[];

/** Bitmask for blocking movement across tile edges. */
export enum NavTileMask {
    EDGE_UP = 1,
    EDGE_RIGHT = 2,
    EDGE_DOWN = 4,
    EDGE_LEFT = 8
}

/** Single tile data: height, activity, occupancy, and edge mask. */
export interface NavTile {
  height: number, // for raised surfaces.
  active: boolean,
  occupied?: boolean,
  /* 4bit mask of closed edges
  1 = up
  2 = right
  4 = down
  8 = left */
  edges: number,
  stepSfx?: StepSFXCategory;
}

/** Full navigation map config plus tile lookup by coord. */
export interface NavMap {
  config: {
    playerHeight: number, // Determines cameras y offset from tile height.
    size: number // width/height of the whole map.
    numTiles: number // number of tiles on one axis, size of tiles determined from size / numTiles.
    offset: {
      x: number,
      y: number // added to every tile height to push it up to "ground"
      z: number
    }
    spawn: NavCoord
    spawnDirection: Direction
  }
  tiles: {
    [coord: NavCoord]: NavTile | undefined
  }
}
/** Cardinal direction *ordering* used by nav movement logic. */
export enum Direction {
    NORTH,
    WEST,
    SOUTH,
    EAST
}
