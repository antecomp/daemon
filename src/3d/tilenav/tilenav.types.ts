import { XYZ, Orientation } from "@/shared/types/3d.types";
import { Accessor, Setter } from "solid-js";
import { SetStoreFunction } from "solid-js/store";

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
  /* 4bit mask of closed edges
  1 = up
  2 = right
  4 = down
  8 = left */
  edges: number,
  stepSfx?: StepSFXCategory;
}

/** Cardinal direction *ordering* used by nav movement logic. */
export enum Direction {
    NORTH,
    WEST,
    SOUTH,
    EAST
}

/** Full navigation map config plus tile lookup by coord. */
export interface NavMap {
  config: {
    playerHeight: number, // Determines cameras y offset from tile height.
    tileSize: number // width/height of the tiles
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

export enum NavAction {
    StepForward,
    StepBack,
    StrafeLeft,
    StrafeRight,
    TurnLeft,
    TurnRight
}

export type NavActionEvent = {
    type: "move";
    action: NavAction;
    origin: NavCoord;
    originDirection: Direction;
    target: NavCoord;
    success: boolean;
} |
{
    type: "turn";
    origin: NavCoord;
    originDirection: Direction;
    action: NavAction;
    targetDirection: Direction;
};

export interface NavController {
    state: Accessor<{
        direction: Direction;
        tile: NavCoord;
        base: {
            pos: XYZ;
            ori: Orientation;
        };
    }>;
    navMap: NavMap;
    setNavMap: SetStoreFunction<NavMap>;
    performNavAction: (action: NavAction) => void;
    setCurrentTile: Setter<NavCoord>;
    occupiedTiles: Accessor<NavCoord[]>;
    occupyTile: (coord: NavCoord) => () => void;
    navListen: (fn: (event: NavActionEvent) => void) => void;
}
