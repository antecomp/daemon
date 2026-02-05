import { NavCoord, NavMap } from "./tilenav.types";

/** Convert NavCoord "x,z" to a [number, number] tuple.
 * Especially helpful when used with array destruc: `const [x, y] = navCoordToTuple(pos)`
 */
export function navCoordToTuple(pos: NavCoord): [number, number] {
    const comma = pos.indexOf(",");
    return [Number(pos.slice(0, comma)), Number(pos.slice(comma + 1))];
}

/** Returns Worldspace position of a tile coordinate, given some NM configuration. */
export function getWSPositionOfTile(pos: NavCoord, nm: NavMap) {
    const tileSize = nm.config.tileSize;
    const [tx, tz] = navCoordToTuple(pos);
    return [
        nm.config.offset.x + tx * tileSize,
        nm.config.offset.y - (nm.tiles[pos]?.height ?? 0),
        nm.config.offset.z + tz * tileSize,
    ];
}