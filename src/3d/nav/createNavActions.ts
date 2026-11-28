import { Direction, NavAction, NavCoord, NavTileMask } from "../tilenav/tilenav.types";
import { navCoordToTuple } from "../tilenav/tilenav.utils";
import { NavState } from "./createNavState";

const KEY_TO_ACTIONS = {
    w: [NavAction.StepForward],
    s: [NavAction.StepBack],
    a: [NavAction.StrafeLeft],
    d: [NavAction.StrafeRight],
    q: [NavAction.TurnLeft],
    e: [NavAction.TurnRight]
} as const satisfies Record<string, NavAction[]>;

// Directions -> Tile Deltas
const dirDX = [0, -1, 0, 1];
const dirDZ = [-1, 0, 1, 0];

// Index corresponds to Direction Enum.
const dirEdge = [
    NavTileMask.EDGE_UP,
    NavTileMask.EDGE_LEFT,
    NavTileMask.EDGE_DOWN,
    NavTileMask.EDGE_RIGHT
];

const targetForDir = (tile: NavCoord, dir: Direction): NavCoord => {
    const [tx, tz] = navCoordToTuple(tile);
    const nx = tx + dirDX[dir];
    const nz = tz + dirDZ[dir];
    return `${nx},${nz}` as NavCoord;
};

// TODO: Rename this, I don't like this name.
export default function createNavActions(nav: NavState, blocked: () => boolean) {
    function canMoveTo(from: NavCoord, dir: Direction, to: NavCoord) {
        const current = nav.navmap.tiles[from];
        if (!current || (current.edges & dirEdge[dir])) return false;
        const target = nav.navmap.tiles[to];
        if (!target || !target.active /* || is occupied */) return false;
        return true;
    }

    function tryMove(dir: Direction) {
        const from = nav.position().tile;
        const to = targetForDir(from, dir);
        if (canMoveTo(from, dir, to)) 
            nav.moveTo(to);
        // todo: return or signal outcome, depending on implementation
    }


}