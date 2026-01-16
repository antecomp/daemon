import { NavController } from "./createTileNavigator";
import cn from './assets/needle.png';
import './nav-compass.css'
import { NavCoord, NavMap } from "./tilenav.types";
import { For, createMemo } from "solid-js";

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
        }[] = [];

        for (let dz = -2; dz <= 2; dz++) {
            for (let dx = -2; dx <= 2; dx++) {
                const tx = cx + dx;
                const tz = cz + dz;
                const inBounds = tx >= 0 && tz >= 0 && tx < n && tz < n;
                const coord = `${tx},${tz}` as NavCoord;
                const tileData = inBounds ? props.nm.tiles[coord] : undefined;
                const exists = !!tileData && tileData.active !== false;
                out.push({
                    coord,
                    inBounds,
                    exists,
                    isCenter: dx === 0 && dz === 0,
                    isSpawn: inBounds && spawn === coord
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
