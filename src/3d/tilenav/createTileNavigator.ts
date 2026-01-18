import { Accessor, Setter, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { NavCoord, NavMap, NavTileMask } from "./tilenav.types";
import { Orientation, XYZ } from "@/shared/types/3d.types";
import {
    BaseCameraSettings,
    CameraControlSignals,
    CameraController,
    CameraOverride,
    CameraSettings
} from "../camera/camera.types";

enum Direction {
    NORTH,
    WEST,
    SOUTH,
    EAST
}

enum NavAction {
    StepForward,
    StepBack,
    StrafeLeft,
    StrafeRight,
    TurnLeft,
    TurnRight
}

export interface NavController {
    state: Accessor<{
        direction: Direction
        tile: NavCoord
        base: {
            pos: XYZ,
            ori: Orientation
        }
    }>

    performNavAction: (action: NavAction) => void;
    setCurrentTile: Setter<NavCoord>;
}

export default function createTileNavigator(
    NM: NavMap
): {
    cameraControlSignals: CameraControlSignals,
    cameraController: CameraController
    navController: NavController
} {
    const [currentTile, setCurrentTile] = createSignal<NavCoord>(NM.config.spawn);

    // TODO: Add initial spawn direction to NM config later.
    const [currentDirection, setCurrentDirection] = createSignal<Direction>(Direction.EAST);
    const [currentYaw, setCurrentYaw] = createSignal(currentDirection() * 90);
    const [baseAnim, setBaseAnim] = createSignal(true);

    const tileSize = createMemo(() => NM.config.size / NM.config.numTiles);

    const halfSize = createMemo(() => NM.config.size / 2);
    const tileOffset = createMemo(() => tileSize() / 2);

    const baseX = createMemo(() => NM.config.offset.x - halfSize() + tileOffset());
    const baseY = createMemo(() => NM.config.offset.y);
    const baseZ = createMemo(() => NM.config.offset.z - halfSize() + tileOffset());

    const cameraPositionForTile = (pos: NavCoord): XYZ => {
        const comma = pos.indexOf(",");
        const tx = Number(pos.slice(0, comma));
        const tz = Number(pos.slice(comma + 1));
        const size = tileSize();
        const y = baseY() - (NM.tiles[pos]?.height ?? 0) - NM.config.playerHeight;
        return [baseX() + tx * size, y, baseZ() + tz * size];
    };

    // Camera Override Stuff (Ripped from createCameraController)
    let nextOverrideID = 0;
    const [overrideStack, setOverrideStack] = createSignal<CameraOverride[]>([]);

    const removeOverride = (id: number) =>
        setOverrideStack(prev => prev.filter(ovr => ovr.id != id));

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

    function clearOverrides(anim?: boolean) {
        (anim != undefined) && setBaseAnim(anim);
        setOverrideStack([]);
    }

    const shouldAnim = () => {
        const ovrAnim = overrideStack().at(-1)?.anim;
        if (ovrAnim == undefined) return baseAnim();
        return ovrAnim;
    };


    const cameraControlSignals: CameraControlSignals = createMemo(() => ({
        basePos: cameraPositionForTile(currentTile()),
        baseOri: {
            yaw: currentYaw(),
            pitch: 0
        },
        overrideOri: currentOverrideOri(),
        overridePos: currentOverridePos(),
        animate: shouldAnim(),
        maxYaw: 45,
        maxPitch: 30
    }));


    // Movement Stuff -------------------------------------

    // Directions -> Tile Deltas
    const dirDX = [0, -1, 0, 1];
    const dirDZ = [-1, 0, 1, 0];
    // Index corresponds to Direction Enum.
    const dirEdge = [
        NavTileMask.EDGE_UP,
        NavTileMask.EDGE_LEFT,
        NavTileMask.EDGE_DOWN,
        NavTileMask.EDGE_RIGHT
    ];

    const tryMove = (dirIndex: Direction) => {
        const tile = currentTile();
        const current = NM.tiles[tile];

        // Blocks you moving through edges marked @ current tile.
        if (!current || !(current.edges & dirEdge[dirIndex])) return;

        const comma = tile.indexOf(",");
        const tx = Number(tile.slice(0, comma));
        const tz = Number(tile.slice(comma + 1));
        const nx = tx + dirDX[dirIndex];
        const nz = tz + dirDZ[dirIndex];
        const next = `${nx},${nz}` as NavCoord;
        const target = NM.tiles[next];
        if (!target || !target.active || target.occupied) return;
        setCurrentTile(next);
    };


    // Controls

    const keyToActions: Record<string, NavAction[]> = {
        w: [NavAction.StepForward],
        s: [NavAction.StepBack],
        q: [NavAction.StrafeLeft],
        e: [NavAction.StrafeRight],
        a: [NavAction.TurnLeft],
        d: [NavAction.TurnRight]
    };


    function performNavAction(action: NavAction) {

        // using & to modulo with bitmask, equiv to (dir + X) % 4
        switch (action) {
            case NavAction.TurnLeft:
                setCurrentDirection(dir => (dir + 1) & 3);
                setCurrentYaw(yaw => yaw + 90);
                break;

            case NavAction.TurnRight:
                setCurrentDirection(dir => (dir + 3) & 3);
                setCurrentYaw(yaw => yaw - 90);
                break;

            case NavAction.StepForward:
                tryMove(currentDirection());
                break;

            case NavAction.StepBack:
                tryMove(((currentDirection() + 2) & 3) as Direction);
                break;

            case NavAction.StrafeLeft:
                tryMove(((currentDirection() + 1) & 3) as Direction);
                break;

            case NavAction.StrafeRight:
                tryMove(((currentDirection() + 3) & 3) as Direction);
                break;
        }
    }

    type ActionTiming = {
        initialDelay: number
        repeatInterval: number
    }

    const ACTION_TIMING: Readonly<Record<NavAction, ActionTiming>> = {
        [NavAction.StepForward]: { initialDelay: 400, repeatInterval: 330 },
        [NavAction.StepBack]: { initialDelay: 400, repeatInterval: 310 },
        [NavAction.StrafeLeft]: { initialDelay: 400, repeatInterval: 310 },
        [NavAction.StrafeRight]: { initialDelay: 400, repeatInterval: 310 },
        [NavAction.TurnLeft]: { initialDelay: 500, repeatInterval: 500 },
        [NavAction.TurnRight]: { initialDelay: 500, repeatInterval: 500 }
    };

    const heldActions = new Set<NavAction>();
    const nextAllowedTime = new Map<NavAction, number>();

    function handleKeyDown(e: KeyboardEvent) {
        const key = e.key.toLocaleLowerCase();

        // Ignore OS's autorepeat.
        if (e.repeat) return;

        const actions = keyToActions[key];
        if (!actions) return;

        const now = performance.now();

        for (const action of actions) {
            heldActions.add(action);

            performNavAction(action);

            // Schedule first repeat after initialDelay
            const timing = ACTION_TIMING[action];
            nextAllowedTime.set(action, now + timing.initialDelay);
        }
    };

    function handleKeyUp(e: KeyboardEvent) {
        const key = e.key.toLocaleLowerCase();
        const actions = keyToActions[key];
        if (!actions) return;

        for (const action of actions) {
            heldActions.delete(action);
            nextAllowedTime.delete(action);
        }
    };

    let raf: number | null = null;

    const loop = (now: number) => {
        for (const action of heldActions) {
            const allowedAt = nextAllowedTime.get(action);
            if (allowedAt === undefined) continue;

            if (now >= allowedAt) {
                performNavAction(action);
                const timing = ACTION_TIMING[action];
                nextAllowedTime.set(action, now + timing.repeatInterval);
            }
        }

        raf = requestAnimationFrame(loop);
    }

    onMount(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        raf = requestAnimationFrame(loop);
    });

    onCleanup(() => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        if (raf !== null) {
            cancelAnimationFrame(raf);
            raf = null;
        }
        heldActions.clear();
        nextAllowedTime.clear();
    });


    // ---- Camera controller API ----

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

    // will this be properly reactive?
    const navState = createMemo(() => ({
        direction: currentDirection(),
        tile: currentTile(),
        base: currentBase()
    }));

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
        },

        navController: {
            state: navState,
            performNavAction,
            setCurrentTile
        }
    };


}