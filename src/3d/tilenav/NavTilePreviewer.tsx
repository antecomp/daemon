import { createMemo, For } from "solid-js";
import { NavMap } from "./tilenav.types";
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

    return (
        <For each={Object.entries(props.NM.tiles)}>
            {([coord, tile]) => {
                const [tx, tz] = coord.split(',').map(Number);
                const x = baseX + tx * tileSize;
                const y = baseY - tile.height //- 20;
                const z = baseZ + tz * tileSize;

                const baseColor = (tx + tz) % 2 === 0 ? "#529958" : "#70ca96";

                // stupid bullshit to actually enforce reactivity.
                const isHovered = createMemo(() => {
                    const h = props.hoveredTile;
                    return !!h && h[0] === tx && h[1] === tz;
                });

                const color = createMemo(() => (isHovered() ? "yellow" : baseColor));

                const walls = [];
                if ((tile.edges & EDGE_UP) === 0) {
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
                if ((tile.edges & EDGE_RIGHT) === 0) {
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
                if ((tile.edges & EDGE_DOWN) === 0) {
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
                if ((tile.edges & EDGE_LEFT) === 0) {
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
                            color={color()}
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
