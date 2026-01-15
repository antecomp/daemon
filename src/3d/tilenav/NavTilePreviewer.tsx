import { For } from "solid-js";
import { NavMap } from "./tilenav.types";

export default function NavTilePreviewer(
    props: {
        NM: NavMap
    }
) {
    const tileSize = props.NM.config.size / props.NM.config.numTiles;
    const halfSize = props.NM.config.size / 2;
    const tileOffset = tileSize / 2;

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
                const color = (tx + tz) % 2 === 0 ? '#529958' : '#70ca96';
                return (
                    <lume-plane
                        color={color}
                        align-point='0.5 0.5'
                        mount-point='0.5 0.5'
                        rotation='90 0 0'
                        position={`${x} ${y} ${z}`}
                        size={`${tileSize} ${tileSize}`}
                        opacity='0.5'
                    />
                )
            }}
        </For>
    )
}