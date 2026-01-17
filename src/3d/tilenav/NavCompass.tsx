import { NavController } from "./createTileNavigator";
import cn from './assets/needle.png';
import './nav-compass.css'
import { NavCoord, NavMap, NavTileMask } from "./tilenav.types";
import { For, createMemo } from "solid-js";

const EDGE_BORDER = "dashed white 1px"
const NOEDGE_BORDER = "solid black 1px;"

export default function NavCompass(props: {
    nc: NavController
    nm: NavMap
}) {
    const gridTiles = createMemo(() => {
        const tile = props.nc.state().tile;
        const comma = tile.indexOf(",");
        const cx = Number(tile.slice(0, comma));
        const cz = Number(tile.slice(comma + 1));
        const n = props.nm.config.numTiles;
        const spawn = props.nm.config.spawn;

        const out: {
            coord: NavCoord
            inBounds: boolean
            exists: boolean
            isCenter: boolean
            isSpawn: boolean
            borderMask: number
        }[] = [];

        for (let dz = -2; dz <= 2; dz++) {
            for (let dx = -2; dx <= 2; dx++) {
                const tx = cx + dx;
                const tz = cz + dz;
                const inBounds = tx >= 0 && tz >= 0 && tx < n && tz < n;
                const coord = `${tx},${tz}` as NavCoord;
                const tileData = inBounds ? props.nm.tiles[coord] : undefined;
                const exists = !!tileData && tileData.active !== false;
                const edges = exists ? (tileData?.edges ?? 15) : 15;
                const borderMask = (~edges) & 15;
                out.push({
                    coord,
                    inBounds,
                    exists,
                    isCenter: dx === 0 && dz === 0,
                    isSpawn: inBounds && spawn === coord,
                    borderMask
                });
            }
        }
        return out;
    });

    return (
        <div class="nav-compass">
            <div class="nav-compass-grid">
                <For each={gridTiles()}>
                    {(tile) => (
                        <div
                            class="nav-compass-tile"
                            classList={{
                                "is-existing": tile.exists,
                                "is-empty": tile.inBounds && !tile.exists,
                                "is-outside": !tile.inBounds,
                                "is-center": tile.isCenter,
                                "is-spawn": tile.isSpawn
                            }}
                            style={{
                                "border-top": (tile.borderMask & NavTileMask.EDGE_UP) ? EDGE_BORDER : NOEDGE_BORDER,
                                "border-right": (tile.borderMask & NavTileMask.EDGE_RIGHT) ? EDGE_BORDER : NOEDGE_BORDER,
                                "border-bottom": (tile.borderMask & NavTileMask.EDGE_DOWN) ? EDGE_BORDER : NOEDGE_BORDER,
                                "border-left": (tile.borderMask & NavTileMask.EDGE_LEFT) ? EDGE_BORDER : NOEDGE_BORDER
                            }}
                        />
                    )}
                </For>
            </div>
            <img
                class="nav-compass-needle"
                src={cn}
                width="20px"
                style={{
                    'rotate': -props.nc.state().base.ori.yaw + 'deg',
                    'transition': 'rotate 0.5s ease'
                }}
            />
        </div>
    )
}
