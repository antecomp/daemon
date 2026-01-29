import { Coord2D } from "@/shared/types/3d.types";
import { NavCoord, NavMap, NavTile, NavTileMask } from "./tilenav.types";
import { createMemo, For } from "solid-js";

export const WINDOW_SIZE_TILES = 11; // centered + 5 on either side.
export const WINDOW_HALF_SIZE = Math.trunc(WINDOW_SIZE_TILES / 2);

export default function NavTilePreviewer(props: {
    NM: NavMap,
    hoveredTile?: NavCoord | null;
    selectedTiles?: NavCoord[];
    clip?: boolean;
    // TODO Only changes the coords these tiles correspond to, shouldn't visually do anything other than supplament the offsets.
    chunkOffset: [number, number]; // positive/negative x,y from center chunk.
}) {

    const tileColor = ([tx, tz]: Coord2D, hasTile: boolean, tileData: NavTile | undefined) => {
        const existsColor = (tx + tz) % 2 === 0 ? "#529958" : "#70ca96";
        const emptyColor = (tx + tz) % 2 === 0 ? "#2b2b2b" : "#3a3a3a";
        const existsAndSelectedColor = (tx + tz) % 2 === 0 ? "#108178" : "#1fc0b3";
        const selectedColor = (tx + tz) % 2 === 0 ? "#2a2341" : "#7c5fb3";

        const navcoord = `${tx},${tz}` as NavCoord;
        const isHovered = props.hoveredTile === navcoord;
        const isSelected = props.selectedTiles?.includes(navcoord);

        if (isHovered) return "yellow";
        if (isSelected && hasTile) return existsAndSelectedColor;
        if (isSelected) return selectedColor;
        if (tileData?.occupied) return '#d86b98'
        return hasTile ? existsColor : emptyColor;
    };

    const coords = createMemo(() => {
        const arrDim = WINDOW_SIZE_TILES * WINDOW_SIZE_TILES
        const out: Coord2D[] = [];
        for (let x = -WINDOW_HALF_SIZE; x <= WINDOW_HALF_SIZE; x++) {
            for (let z = -WINDOW_HALF_SIZE; z <= WINDOW_HALF_SIZE; z++) {
                out.push([x, z]);
            }
        }

        return out;
    });

    const tileSize = createMemo(() => props.NM.config.tileSize);
    const tileOffsets = createMemo(() => props.NM.config.offset);

    const wallHeight = createMemo(() => tileSize() / 3);
    const wallOffset = createMemo(() => tileSize() / 2);
    const wallEps = 0.01; // constant is fine

    return (
        <For each={coords()}>
            {([tx, tz]) => {
                const coordKey: NavCoord = `${tx},${tz}`;
                const tile = createMemo(() => props.NM.tiles[coordKey]);

                const x = () => tileOffsets().x + (tx * tileSize());
                const y = () => tileOffsets().y - (tile()?.height ?? 0);
                const z = () => tileOffsets().z + (tz * tileSize());

                const hasTile = () => !!tile();
                const edges = () => tile()?.edges ?? 0;

                // TODO: Change this to use instance geometry later. Much more performant.
                return (
                    <>
                        <lume-plane
                            sidedness="double"
                            color={tileColor([tx, tz], hasTile(), tile())}
                            align-point="0.5 0.5"
                            mount-point="0.5 0.5"
                            rotation="90 0 0"
                            position={`${x()} ${y()} ${z()}`}
                            size={`${tileSize()} ${tileSize()}`}
                            opacity="0.5"
                            depth-test={props.clip ? "false" : "true"}
                            depth-write={props.clip ? "false" : "true"}
                        />

                        {props.NM.config.spawn == coordKey && <lume-sphere
                            color='red'
                            mount-point='0.5 0.5'
                            align-point='0.5 0.5'
                            size={`${tileSize() / 2}`}
                            position={`${x()} ${y() - props.NM.config.playerHeight} ${z()}`}
                        />}

                        {hasTile() && (edges() & NavTileMask.EDGE_UP) !== 0 && (
                            <lume-plane
                                color="#ff3b30"
                                sidedness="double"
                                align-point="0.5 0.5"
                                mount-point="0.5 0.5"
                                position={`${x()} ${y() - wallHeight() / 2} ${z() - wallOffset() - wallEps
                                    }`}
                                size={`${tileSize()} ${wallHeight()}`}
                                opacity="0.8"
                            />
                        )}

                        {hasTile() && (edges() & NavTileMask.EDGE_RIGHT) !== 0 && (
                            <lume-plane
                                color="#ff3b30"
                                sidedness="double"
                                align-point="0.5 0.5"
                                mount-point="0.5 0.5"
                                rotation="0 90 0"
                                position={`${x() + wallOffset() + wallEps} ${y() - wallHeight() / 2
                                    } ${z()}`}
                                size={`${tileSize()} ${wallHeight()}`}
                                opacity="0.8"
                            />
                        )}

                        {hasTile() && (edges() & NavTileMask.EDGE_DOWN) !== 0 && (
                            <lume-plane
                                color="#ff3b30"
                                sidedness="double"
                                align-point="0.5 0.5"
                                mount-point="0.5 0.5"
                                position={`${x()} ${y() - wallHeight() / 2} ${z() + wallOffset() + wallEps
                                    }`}
                                size={`${tileSize()} ${wallHeight()}`}
                                opacity="0.8"
                            />
                        )}

                        {hasTile() && (edges() & NavTileMask.EDGE_LEFT) !== 0 && (
                            <lume-plane
                                color="#ff3b30"
                                sidedness="double"
                                align-point="0.5 0.5"
                                mount-point="0.5 0.5"
                                rotation="0 90 0"
                                position={`${x() - wallOffset() - wallEps} ${y() - wallHeight() / 2
                                    } ${z()}`}
                                size={`${tileSize()} ${wallHeight()}`}
                                opacity="0.8"
                            />
                        )}
                    </>
                )
            }}
        </For>
    );
}