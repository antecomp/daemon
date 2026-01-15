import { createMemo, For } from "solid-js";
import { NavCoord, NavMap } from "./tilenav.types";
import { Coord2D } from "@/shared/types/3d.types";

export default function NavTilePreviewer(
    props: {
        NM: NavMap
        hoveredTile?: Coord2D | null;
        clip?: boolean
    }
) {
    const tileSize = props.NM.config.size / props.NM.config.numTiles;
    const halfSize = props.NM.config.size / 2;
    const tileOffset = tileSize / 2;
    const wallHeight = tileSize / 3;
    const wallOffset = tileSize / 2;
    const wallEps = 0.01;

    const EDGE_UP = 1;
    const EDGE_RIGHT = 2;
    const EDGE_DOWN = 4;
    const EDGE_LEFT = 8;

    const baseX = props.NM.config.offset.x - halfSize + tileOffset;
    const baseY = props.NM.config.offset.y;
    const baseZ = props.NM.config.offset.z - halfSize + tileOffset;

    const tileColor = ([tx, tz]: Coord2D, hasTile: boolean) => {
        const baseColor = (tx + tz) % 2 === 0 ? "#529958" : "#70ca96";
        const emptyColor = (tx + tz) % 2 === 0 ? "#2b2b2b" : "#3a3a3a";
        const h = props.hoveredTile;
        const isHovered = !!h && h[0] == tx && h[1] == tz;
        if (isHovered) return 'yellow';
        return hasTile ? baseColor : emptyColor;
    }

    const tileAt = (coordKey: NavCoord) => props.NM.tiles[coordKey];

    return (
        <For
            each={Array.from({ length: props.NM.config.numTiles ** 2 }, (_, i) => ([
                i % props.NM.config.numTiles,
                Math.floor(i / props.NM.config.numTiles),
            ] as Coord2D))}
        >
            {([tx, tz]) => {
                const coordKey = `${tx},${tz}` as const;
                //const tile = props.NM.tiles[coordKey];
                const tile = createMemo(() => tileAt(coordKey));
                const x = baseX + tx * tileSize;
                const y = baseY - (tile()?.height ?? 0) //- 20;
                const z = baseZ + tz * tileSize;

                const walls = [];
                if (tile() && (tile().edges & EDGE_UP) === 0) {
                    walls.push(
                        <lume-plane
                            color='#ff3b30'
                            sidedness="double"
                            align-point='0.5 0.5'
                            mount-point='0.5 0.5'
                            position={`${x} ${y - wallHeight / 2} ${z - wallOffset - wallEps}`}
                            size={`${tileSize} ${wallHeight}`}
                            opacity='0.8'
                        />
                    );
                }
                if (tile() && (tile().edges & EDGE_RIGHT) === 0) {
                    walls.push(
                        <lume-plane
                            color='#ff3b30'
                            sidedness="double"
                            align-point='0.5 0.5'
                            mount-point='0.5 0.5'
                            rotation='0 90 0'
                            position={`${x + wallOffset + wallEps} ${y - wallHeight / 2} ${z}`}
                            size={`${tileSize} ${wallHeight}`}
                            opacity='0.8'
                        />
                    );
                }
                if (tile() && (tile().edges & EDGE_DOWN) === 0) {
                    walls.push(
                        <lume-plane
                            color='#ff3b30'
                            sidedness="double"
                            align-point='0.5 0.5'
                            mount-point='0.5 0.5'
                            position={`${x} ${y - wallHeight / 2} ${z + wallOffset + wallEps}`}
                            size={`${tileSize} ${wallHeight}`}
                            opacity='0.8'
                        />
                    );
                }
                if (tile() && (tile().edges & EDGE_LEFT) === 0) {
                    walls.push(
                        <lume-plane
                            color='#ff3b30'
                            sidedness="double"
                            align-point='0.5 0.5'
                            mount-point='0.5 0.5'
                            rotation='0 90 0'
                            position={`${x - wallOffset - wallEps} ${y - wallHeight / 2} ${z}`}
                            size={`${tileSize} ${wallHeight}`}
                            opacity='0.8'
                        />
                    );
                }
                return (
                    <>
                        <lume-plane
                            sidedness="double"
                            color={tileColor([tx, tz], !!tile())}
                            align-point='0.5 0.5'
                            mount-point='0.5 0.5'
                            rotation='90 0 0'
                            position={`${x} ${y} ${z}`}
                            size={`${tileSize} ${tileSize}`}
                            opacity='0.5'
                            depth-test={props.clip ? 'false' : 'true'}
                            depth-write={props.clip ? 'false' : 'true'}
                        />
                        {walls}
                    </>
                )
            }}
        </For>
    )
}
