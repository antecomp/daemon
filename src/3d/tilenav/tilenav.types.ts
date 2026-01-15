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
    spawn: `${number},${number}`
  }
  tiles: {
    [coord: `${number},${number}`]: NavTile
  }
}

export const TEST_NAVMAP: NavMap = {
  config: {
    playerHeight: 1.7,
    size: 1250,
    numTiles: 10,
    offset: {
      x: 0,
      y: 25,
      z: 0
    },
    spawn: "0,0",
  },
  tiles: {
    "0,0": { height: 20, active: true, edges: 0 },
    "1,0": { height: 20, active: true, edges: 15 },
    "2,0": { height: 20, active: true, edges: 15 },
    "3,0": { height: 20, active: true, edges: 15 },
    "4,0": { height: 20, active: true, edges: 15 },
    "5,0": { height: 20, active: true, edges: 15 },
    "6,0": { height: 20, active: true, edges: 15 },
    "7,0": { height: 20, active: true, edges: 15 },
    "8,0": { height: 20, active: true, edges: 15 },
    "9,0": { height: 20, active: true, edges: 15 },

    "0,1": { height: 0, active: true, edges: 15 },
    "1,1": { height: 0, active: true, edges: 15 },
    "2,1": { height: 0, active: true, edges: 15 },
    "3,1": { height: 0, active: true, edges: 15 },
    "4,1": { height: 0, active: true, edges: 15 },
    "5,1": { height: 0, active: true, edges: 15 },
    "6,1": { height: 0, active: true, edges: 15 },
    "7,1": { height: 0, active: true, edges: 15 },
    "8,1": { height: 0, active: true, edges: 15 },
    "9,1": { height: 0, active: true, edges: 15 },

    "0,2": { height: 0, active: true, edges: 15 },
    "1,2": { height: 0, active: true, edges: 15 },
    "2,2": { height: 0, active: true, edges: 15 },
    "3,2": { height: 0, active: true, edges: 15 },
    "4,2": { height: 0, active: true, edges: 15 },
    "5,2": { height: 0, active: true, edges: 15 },
    "6,2": { height: 0, active: true, edges: 15 },
    "7,2": { height: 0, active: true, edges: 15 },
    "8,2": { height: 0, active: true, edges: 15 },
    "9,2": { height: 0, active: true, edges: 15 },

    "0,3": { height: 0, active: true, edges: 15 },
    "1,3": { height: 0, active: true, edges: 15 },
    "2,3": { height: 0, active: true, edges: 15 },
    "3,3": { height: 0, active: true, edges: 15 },
    "4,3": { height: 0, active: true, edges: 15 },
    "5,3": { height: 0, active: true, edges: 15 },
    "6,3": { height: 0, active: true, edges: 15 },
    "7,3": { height: 0, active: true, edges: 15 },
    "8,3": { height: 0, active: true, edges: 15 },
    "9,3": { height: 0, active: true, edges: 15 },

    "0,4": { height: 0, active: true, edges: 15 },
    "1,4": { height: 0, active: true, edges: 15 },
    "2,4": { height: 0, active: true, edges: 15 },
    "3,4": { height: 0, active: true, edges: 15 },
    "4,4": { height: 0, active: true, edges: 15 },
    "5,4": { height: 0, active: true, edges: 15 },
    "6,4": { height: 0, active: true, edges: 15 },
    "7,4": { height: 0, active: true, edges: 15 },
    "8,4": { height: 0, active: true, edges: 15 },
    "9,4": { height: 0, active: true, edges: 15 },

    "0,5": { height: 0, active: true, edges: 15 },
    "1,5": { height: 0, active: true, edges: 15 },
    "2,5": { height: 0, active: true, edges: 15 },
    "3,5": { height: 0, active: true, edges: 15 },
    "4,5": { height: 0, active: true, edges: 15 },
    "5,5": { height: 0, active: true, edges: 15 },
    "6,5": { height: 0, active: true, edges: 15 },
    "7,5": { height: 0, active: true, edges: 15 },
    "8,5": { height: 0, active: true, edges: 15 },
    "9,5": { height: 0, active: true, edges: 15 },

    "0,6": { height: 0, active: true, edges: 15 },
    "1,6": { height: 0, active: true, edges: 15 },
    "2,6": { height: 0, active: true, edges: 15 },
    "3,6": { height: 0, active: true, edges: 15 },
    "4,6": { height: 0, active: true, edges: 15 },
    "5,6": { height: 0, active: true, edges: 15 },
    "6,6": { height: 0, active: true, edges: 15 },
    "7,6": { height: 0, active: true, edges: 15 },
    "8,6": { height: 0, active: true, edges: 15 },
    "9,6": { height: 0, active: true, edges: 15 },

    "0,7": { height: 0, active: true, edges: 15 },
    "1,7": { height: 0, active: true, edges: 15 },
    "2,7": { height: 0, active: true, edges: 3 },
    "3,7": { height: 0, active: true, edges: 15 },
    "4,7": { height: 0, active: true, edges: 15 },
    "5,7": { height: 0, active: true, edges: 15 },
    "6,7": { height: 0, active: true, edges: 15 },
    "7,7": { height: 0, active: true, edges: 15 },
    "8,7": { height: 0, active: true, edges: 15 },
    "9,7": { height: 0, active: true, edges: 15 },

    "0,8": { height: 0, active: true, edges: 15 },
    "1,8": { height: 0, active: true, edges: 15 },
    "2,8": { height: 0, active: true, edges: 15 },
    "3,8": { height: 0, active: true, edges: 15 },
    "4,8": { height: 0, active: true, edges: 15 },
    "5,8": { height: 0, active: true, edges: 15 },
    "6,8": { height: 0, active: true, edges: 15 },
    "7,8": { height: 0, active: true, edges: 15 },
    "8,8": { height: 0, active: true, edges: 15 },
    "9,8": { height: 0, active: true, edges: 15 },

    "0,9": { height: 0, active: true, edges: 15 },
    "1,9": { height: 0, active: true, edges: 15 },
    "2,9": { height: 0, active: true, edges: 15 },
    "3,9": { height: 0, active: true, edges: 15 },
    "4,9": { height: 0, active: true, edges: 15 },
    "5,9": { height: 0, active: true, edges: 15 },
    "6,9": { height: 0, active: true, edges: 15 },
    "7,9": { height: 0, active: true, edges: 15 },
    "8,9": { height: 0, active: true, edges: 15 },
    "9,9": { height: 0, active: true, edges: 15 },
  },
};
