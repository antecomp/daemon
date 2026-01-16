export type NavCoord = `${number},${number}`

export enum NavTileMask {
    EDGE_UP = 1,
    EDGE_RIGHT = 2,
    EDGE_DOWN = 4,
    EDGE_LEFT = 8
}

export interface NavTile {
  height: number, // for raised surfaces.
  active: boolean,
  /* 4bit mask of navigation 
  1 = up
  2 = right
  4 = down
  8 = left */
  edges: number
}

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
  }
  tiles: {
    [coord: NavCoord]: NavTile
  }
}