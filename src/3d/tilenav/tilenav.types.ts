/** Tile coordinate key formatted as "x,z" in grid space. */
export type NavCoord = `${number},${number}`

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
  /* 4bit mask of navigation 
  1 = up
  2 = right
  4 = down
  8 = left */
  edges: number
}

/** Full navigation map config plus tile lookup by coord. */
export interface NavMap {
  config: {
    playerHeight: number,
    size: number // physical size of the entire thing. divided by numtiles.
    numTiles: number // physical size divided up to make this number of tiles.
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
