import { Setter, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { NavCoord, NavMap, NavTileMask } from "./tilenav.types";
import { Orientation, XYZ } from "@/shared/types/3d.types";
import { BaseCameraSettings, CameraControlSignals, CameraController, CameraOverride, CameraSettings } from "../camera/camera.types";

enum Direction {
    NORTH, WEST, SOUTH, EAST
}

export default function createTileNavigator(
    NM: NavMap
): {
    cameraControlSignals: CameraControlSignals,
    cameraController: CameraController
} {

    const [currentTile, setCurrentTile] = createSignal<NavCoord>(NM.config.spawn);

    // TODO: Add to NM config later.
    const [currentDirection, setCurrentDirection] = createSignal<Direction>(Direction.EAST);
    const [currentYaw, setCurrentYaw] = createSignal(currentDirection() * 90);
    const [baseAnim, setBaseAnim] = createSignal(true);

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

    let nextOverrideID = 0;
    const [overrideStack, setOverrideStack] = createSignal<CameraOverride[]>([]);

    const removeOverride = (id: number) => setOverrideStack(prev => prev.filter(ovr => ovr.id != id));

    function createOverride(ovr: CameraSettings) {
        const id = nextOverrideID++;
        return {
            commit(anim?: boolean) {
                if (overrideStack().some(o => o.id == id)) return;
                (anim != undefined) && setBaseAnim(anim);
                setOverrideStack(prev => [...prev, { id, ...ovr }]);
            },
            release(anim?: boolean) {
                (anim != undefined) && setBaseAnim(anim);
                removeOverride(id);
            },
            id
        };
    }

    const currentOverridePos = () => overrideStack().at(-1)?.pos;
    const currentOverrideOri = () => overrideStack().at(-1)?.ori;

    const shouldAnim = () => {
        const ovrAnim = overrideStack().at(-1)?.anim;
        if (ovrAnim == undefined) return baseAnim();
        return ovrAnim;
    };

    function clearOverrides(anim?: boolean) {
        (anim != undefined) && setBaseAnim(anim);
        setOverrideStack([]);
    }

    const cameraControlSignals: CameraControlSignals = createMemo(() => ({
        basePos: cameraPositionForTile(currentTile()),
        baseOri: {
            yaw: currentYaw(),
            pitch: 0
        },
        overrideOri: currentOverrideOri(),
        overridePos: currentOverridePos(),
        animate: shouldAnim(),
        maxYaw: 30,
        maxPitch: 30
    }));

    const dirDX = [0, -1, 0, 1];
    const dirDZ = [-1, 0, 1, 0];
    const dirEdge = [NavTileMask.EDGE_UP, NavTileMask.EDGE_LEFT, NavTileMask.EDGE_DOWN, NavTileMask.EDGE_RIGHT];

    const tryMove = (dirIndex: Direction) => {
        const tile = currentTile();
        const current = NM.tiles[tile];
        if (!current || !(current.edges & dirEdge[dirIndex])) return;

        const comma = tile.indexOf(",");
        const tx = Number(tile.slice(0, comma));
        const tz = Number(tile.slice(comma + 1));
        const nx = tx + dirDX[dirIndex];
        const nz = tz + dirDZ[dirIndex];
        const next = `${nx},${nz}` as NavCoord;
        const target = NM.tiles[next];
        if (!target || !target.active) return;
        setCurrentTile(next);
    };

    const onKeyDown = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (key === "a") {
            setCurrentDirection((dir) => (dir + 1) & 3);
            setCurrentYaw((yaw) => yaw + 90);
        } else if (key === "d") {
            setCurrentDirection((dir) => (dir + 3) & 3);
            setCurrentYaw((yaw) => yaw - 90);
        } else if (key === "w") {
            tryMove(currentDirection());
        } else if (key === "s") {
            tryMove(((currentDirection() + 2) & 3) as Direction);
        } else if (key === "q") {
            tryMove(((currentDirection() + 1) & 3) as Direction);
        } else if (key === "e") {
            tryMove(((currentDirection() + 3) & 3) as Direction);
        }
    };

    onMount(() => document.addEventListener("keydown", onKeyDown));
    onCleanup(() => document.removeEventListener("keydown", onKeyDown));

    const currentBase = () => ({
        pos: cameraPositionForTile(currentTile()),
        ori: {
            yaw: currentYaw(),
            pitch: 0
        }
    });

    const currentOverride = () => {
        const ori = currentOverrideOri();
        const pos = currentOverridePos();
        if (ori == undefined && pos == undefined) return null;
        return { pos, ori };
    };

    const setBase: CameraController["setBase"] = (_settings: BaseCameraSettings) => {
        throw new Error("Tile navigator does not support setBase overrides.");
    };

    const setBasePos: Setter<XYZ> = (_next: XYZ | ((prev: XYZ) => XYZ)) => {
        throw new Error("Tile navigator does not support setBasePos overrides.");
    };

    const setBaseOri: Setter<Orientation> = (_next: Orientation | ((prev: Orientation) => Orientation)) => {
        throw new Error("Tile navigator does not support setBaseOri overrides.");
    };

    return {
        cameraControlSignals,
        cameraController: {
            createOverride,
            removeOverride,
            clearOverrides,
            setBase,
            setBasePos,
            setBaseOri,
            currentBase,
            currentOverride
        }
    };
}
