import { Accessor, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { NavCoord, NavMap } from "./tilenav.types";
import { Coord2D, XYZ } from "@/shared/types/3d.types";
import { CameraControlSignals } from "../camera/camera.types";

enum Direction {
    NORTH, WEST, SOUTH, EAST
}

export default function createTileNavigator(
    NM: NavMap
): CameraControlSignals {

    const [currentTile, setCurrentTile] = createSignal<NavCoord>(NM.config.spawn);

    // TODO: Add to NM config later.
    const [currentDirection, setCurrentDirection] = createSignal<Direction>(Direction.EAST);
    const [currentYaw, setCurrentYaw] = createSignal(currentDirection() * 90);

    const tileSize = createMemo(() => NM.config.size / NM.config.numTiles);

    const halfSize = createMemo(() => NM.config.size / 2);
    const tileOffset = createMemo(() => tileSize() / 2);

    const baseX = createMemo( () => NM.config.offset.x - halfSize() + tileOffset());
    const baseY = createMemo(() => NM.config.offset.y);
    const baseZ = createMemo( () => NM.config.offset.z - halfSize() + tileOffset());

    const cameraPositionForTile = (pos: NavCoord): XYZ => {
        const comma = pos.indexOf(",");
        const tx = Number(pos.slice(0, comma));
        const tz = Number(pos.slice(comma + 1));
        const size = tileSize();
        const y = baseY() - (NM.tiles[pos]?.height ?? 0) - NM.config.playerHeight;
        return [baseX() + tx * size, y, baseZ() + tz * size];
    };

    const cameraControlSignals: CameraControlSignals = createMemo(() => ({
        basePos: cameraPositionForTile(currentTile()),
        baseOri: {
            yaw: currentYaw(),
            pitch: 0
        },
        overrideOri: undefined,
        overridePos: undefined,
        animate: true,
        maxYaw: 30,
        maxPitch: 30
    }));

    const onKeyDown = (e: KeyboardEvent) => {
        const key = e.key;
        if (key === "q" || key === "Q") {
            setCurrentDirection((dir) => (dir + 1) & 3);
            setCurrentYaw((yaw) => yaw + 90);
        } else if (key === "e" || key === "E") {
            setCurrentDirection((dir) => (dir + 3) & 3);
            setCurrentYaw((yaw) => yaw - 90);
        }
    };

    onMount(() => document.addEventListener("keydown", onKeyDown));
    onCleanup(() => document.removeEventListener("keydown", onKeyDown));

    return cameraControlSignals;
}
