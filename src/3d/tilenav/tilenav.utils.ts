import { NavCoord, NavMap } from "./tilenav.types";

export function getWSPositionOfTile(pos: NavCoord, nm: NavMap) {
    const tileSize = nm.config.size / nm.config.numTiles;
    const halfSize = nm.config.size / 2;
    const tileOffset = tileSize / 2;

    const baseX = nm.config.offset.x - halfSize + tileOffset;
    const baseY = nm.config.offset.y;
    const baseZ = nm.config.offset.z - halfSize + tileOffset;

    const comma = pos.indexOf(",");
    const tx = Number(pos.slice(0, comma));
    const tz = Number(pos.slice(comma + 1));
    return [
        baseX + tx * tileSize,
        baseY - (nm.tiles[pos]?.height ?? 0),
        baseZ + tz * tileSize
    ]
}