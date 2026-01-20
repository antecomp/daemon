import { NavCoord, NavMap } from "./tilenav.types";

/** Convert NavCoord "x,z" to a [number, number] tuple.
 * Especially helpful when used with array destruc: `const [x, y] = navCoordToTuple(pos)`
 */
export function navCoordToTuple(pos: NavCoord): [number, number] {
    const comma = pos.indexOf(",");
    return [Number(pos.slice(0, comma)), Number(pos.slice(comma + 1))];
}

/** Given a NavCoord (tile coordinate) and associated NavMap, 
 * returns a 3-number tuple of the WS position of that tile. */
export function getWSPositionOfTile(pos: NavCoord, nm: NavMap) {
    const tileSize = nm.config.size / nm.config.numTiles;
    const halfSize = nm.config.size / 2;
    const tileOffset = tileSize / 2;

    const baseX = nm.config.offset.x - halfSize + tileOffset;
    const baseY = nm.config.offset.y;
    const baseZ = nm.config.offset.z - halfSize + tileOffset;

    const [tx, tz] = navCoordToTuple(pos);
    return [
        baseX + tx * tileSize,
        baseY - (nm.tiles[pos]?.height ?? 0),
        baseZ + tz * tileSize
    ]
}
