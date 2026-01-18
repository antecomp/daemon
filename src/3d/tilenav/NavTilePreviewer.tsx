import { createMemo, For } from "solid-js";
import { NavCoord, NavMap, NavTile, NavTileMask } from "./tilenav.types";
import { Coord2D } from "@/shared/types/3d.types";

export default function NavTilePreviewer(props: {
  NM: NavMap;
  hoveredTile?: NavCoord | null;
  selectedTiles?: NavCoord[];
  clip?: boolean;
}) {
  // --- reactive config-derived values ---

  const tileSize = createMemo(
    () => props.NM.config.size / props.NM.config.numTiles
  );

  const halfSize = createMemo(() => props.NM.config.size / 2);
  const tileOffset = createMemo(() => tileSize() / 2);
  const wallHeight = createMemo(() => tileSize() / 3);
  const wallOffset = createMemo(() => tileSize() / 2);
  const wallEps = 0.01; // constant is fine

  const baseX = createMemo(
    () => props.NM.config.offset.x - halfSize() + tileOffset()
  );
  const baseY = createMemo(() => props.NM.config.offset.y);
  const baseZ = createMemo(
    () => props.NM.config.offset.z - halfSize() + tileOffset()
  );

  // --- helpers ---

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
    if(tileData?.occupied) return '#d86b98'
    return hasTile ? existsColor : emptyColor;
  };

  const coords = createMemo(() => {
    const n = props.NM.config.numTiles;
    const out: Coord2D[] = new Array(n * n);
    for (let i = 0; i < n * n; i++) {
      out[i] = [i % n, Math.floor(i / n)];
    }
    return out;
  });

  // --- render ---

  return (
    <For each={coords()}>
      {([tx, tz]) => {
        const coordKey = `${tx},${tz}` as NavCoord;

        // accessors that read from the store
        const tile = () => props.NM.tiles[coordKey];

        const x = () => baseX() + tx * tileSize();
        const z = () => baseZ() + tz * tileSize();
        const y = () => baseY() - (tile()?.height ?? 0);

        const hasTile = () => !!tile();
        const edges = () => tile()?.edges ?? 0;

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
                size="20 20 20"
                position={`${x()} ${y() - props.NM.config.playerHeight} ${z()}`}
            />}

            {hasTile() && (edges() & NavTileMask.EDGE_UP) === 0 && (
              <lume-plane
                color="#ff3b30"
                sidedness="double"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                position={`${x()} ${y() - wallHeight() / 2} ${
                  z() - wallOffset() - wallEps
                }`}
                size={`${tileSize()} ${wallHeight()}`}
                opacity="0.8"
              />
            )}

            {hasTile() && (edges() & NavTileMask.EDGE_RIGHT) === 0 && (
              <lume-plane
                color="#ff3b30"
                sidedness="double"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                rotation="0 90 0"
                position={`${x() + wallOffset() + wallEps} ${
                  y() - wallHeight() / 2
                } ${z()}`}
                size={`${tileSize()} ${wallHeight()}`}
                opacity="0.8"
              />
            )}

            {hasTile() && (edges() & NavTileMask.EDGE_DOWN) === 0 && (
              <lume-plane
                color="#ff3b30"
                sidedness="double"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                position={`${x()} ${y() - wallHeight() / 2} ${
                  z() + wallOffset() + wallEps
                }`}
                size={`${tileSize()} ${wallHeight()}`}
                opacity="0.8"
              />
            )}

            {hasTile() && (edges() & NavTileMask.EDGE_LEFT) === 0 && (
              <lume-plane
                color="#ff3b30"
                sidedness="double"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                rotation="0 90 0"
                position={`${x() - wallOffset() - wallEps} ${
                  y() - wallHeight() / 2
                } ${z()}`}
                size={`${tileSize()} ${wallHeight()}`}
                opacity="0.8"
              />
            )}
          </>
        );
      }}
    </For>
  );
}
