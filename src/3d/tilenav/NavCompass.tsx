import { createMemo, For, Show } from "solid-js";
import { NavController } from "./createTileNavigator";
import { NavCoord, NavMap, NavTileMask } from "./tilenav.types";
import { navCoordToTuple } from "./tilenav.utils";
import cn from './assets/needle.png';
import './nav-compass.css'
import { DialogueService } from "@/core/dialogue/dialogueService";

const EDGE_BORDER = "dashed white 1px"
const NOEDGE_BORDER = "solid black 1px;"

const COMPASS_SPAN = 4;

/**
 * Renders a compact 5x5 navigational compass/minimap centered on the current navigation tile,
 * plus a rotating needle indicating the current yaw orientation.
 * 
 * @param props - An object containing:
 *   - nc: NavController — provides current navigation state and orientation.
 *   - nm: NavMap — provides map tiles and configuration.
 * @returns JSX.Element — a navigational compass element (grid + rotating needle).
 *
 * @remark Typically you want to pass the reactive NM store that's part of navController, as to add reactivity to the minimap.
 * @example
 * <NavCompass nc={navController} nm={navController.navMap} />
 */
export default function NavCompass(props: {
    nc: NavController
    nm: NavMap
}) {
    const gridTiles = createMemo(() => {
        const currentTile = props.nc.state().tile;
        const [cx, cz] = navCoordToTuple(currentTile);
        const spawn = props.nm.config.spawn;

        const out: {
            coord: NavCoord
            exists: boolean
            isCenter: boolean
            isSpawn: boolean
            borderMask: number
            occupied: boolean
        }[] = [];

        for (let dz = -COMPASS_SPAN; dz <= COMPASS_SPAN; dz++) {
            for (let dx = -COMPASS_SPAN; dx <= COMPASS_SPAN; dx++) {
                const tx = cx + dx;
                const tz = cz + dz;
                const coord = `${tx},${tz}` as NavCoord;
                const tileData = props.nm.tiles[coord];
                const exists = !!tileData && tileData.active;
                const edges = exists ? (tileData.edges) : 0;
                const borderMask = edges & 15;
                out.push({
                    coord,
                    exists,
                    isCenter: dx === 0 && dz === 0,
                    isSpawn: spawn === coord,
                    borderMask,
                    occupied: tileData?.occupied ?? false
                });
            }
        }

        return out;
    });

    return (
        <Show when={!DialogueService.dialogueOngoing()}>
            <div class='nav-compass'>
                <div class='nav-compass-grid'
                    style={{ 'grid-template-columns': `repeat(${1 + (2 * COMPASS_SPAN)}, 1fr)` }}
                >
                    <For each={gridTiles()}>
                        {tile =>
                            <div
                                class="nav-compass-tile"
                                classList={{
                                    "is-existing": tile.exists,
                                    "is-empty": !tile.exists,
                                    "is-center": tile.isCenter,
                                    "is-spawn": tile.isSpawn,
                                    "is-occupied": tile.occupied
                                }}
                                style={{
                                    "border-top": (tile.borderMask & NavTileMask.EDGE_UP) ? EDGE_BORDER : NOEDGE_BORDER,
                                    "border-right": (tile.borderMask & NavTileMask.EDGE_RIGHT) ? EDGE_BORDER : NOEDGE_BORDER,
                                    "border-bottom": (tile.borderMask & NavTileMask.EDGE_DOWN) ? EDGE_BORDER : NOEDGE_BORDER,
                                    "border-left": (tile.borderMask & NavTileMask.EDGE_LEFT) ? EDGE_BORDER : NOEDGE_BORDER
                                }}
                            />
                        }
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
        </Show>
    )
}