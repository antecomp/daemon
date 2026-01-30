import { Accessor, Setter, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { Direction, NavCoord, NavMap, NavTileMask } from "./tilenav.types";
import { Orientation, XYZ } from "@/shared/types/3d.types";
import { createPayloadEmitter } from "@/shared/utils/emitter";
import {
    BaseCameraSettings,
    CameraControlSignals,
    CameraController,
    CameraOverride,
    CameraSettings
} from "../camera/camera.types";
import { createStore, SetStoreFunction } from "solid-js/store";
import { navCoordToTuple } from "./tilenav.utils"
import playStepSound from "./stepsound";

export enum NavAction {
    StepForward,
    StepBack,
    StrafeLeft,
    StrafeRight,
    TurnLeft,
    TurnRight
}

export type NavActionEvent =
    | {
        type: "move";
        action: NavAction;
        origin: NavCoord;
        originDirection: Direction;
        target: NavCoord;
        success: boolean;
    }
    | {
        type: "turn";
        origin: NavCoord;
        originDirection: Direction;
        action: NavAction;
        targetDirection: Direction;
    };

export interface NavController {
    state: Accessor<{
        direction: Direction
        tile: NavCoord
        base: {
            pos: XYZ,
            ori: Orientation
        }
    }>
    navMap: NavMap,
    setNavMap: SetStoreFunction<NavMap>
    performNavAction: (action: NavAction) => void;
    setCurrentTile: Setter<NavCoord>;
}

/**
 * createTileNavigator
 *
 * Initializes and returns a tile-based navigation subsystem and a camera controller
 * for a grid-like navigation map.
 *
 * @param initialNM - The initial NavMap describing tiles, configuration (size,
 *   offset, spawn point/direction, player height, numTiles), and per-tile data
 *   (height, active, occupied, edges bitmask, etc.).
 *
 * @returns An object containing:
 *   - cameraControlSignals: CameraControlSignals
 *       A memoized signals object used by PlayerCam. It
 *       provides:
 *         - basePos: computed XYZ position at the current tile (takes tile
 *           height and player height into account).
 *         - baseOri: base orientation with current yaw and zero pitch.
 *         - overridePos / overrideOri: the top-most active camera override
 *           (if any) from the override stack.
 *         - animate: whether camera transitions should animate (considers both
 *           base animation flag and top-most override's anim flag).
 *         - maxYaw / maxPitch: clamped limits used by the camera consumer.
 *
 *   - cameraController: CameraController
 *       A small API to manage camera overrides and query current base/override (replicating return of normal createCameraController)
 *       states. Methods:
 *         - createOverride(settings): returns an object { id, commit(anim?), release(anim?) }
 *             which can commit the override to the active override stack or release it.
 *             Each override is assigned a unique numeric id.
 *         - removeOverride(id): remove an override by id.
 *         - clearOverrides(anim?): clear all overrides.
 *         - setBase(...): throws — tile navigator does not support direct base overrides.
 *         - setBasePos(...): throws - not supported.
 *         - setBaseOri(...): throws - not supported.
 *         - currentBase(): returns the current base camera { pos, ori } computed
 *             from the current tile and direction.
 *         - currentOverride(): returns the current override { pos?, ori? } or null.
 *
 *   - navController: NavController
 *       Navigation API and live state:
 *         - state: Accessor of a reactive object containing:
 *             - direction: current Direction enum value (0-3).
 *             - tile: current NavCoord (string key like "x,z").
 *             - base: { pos: XYZ, ori: Orientation } representing current base camera.
 *         - navMap: reactive NavMap store (cloned from initialNM).
 *         - setNavMap: SetStoreFunction to update the navMap store.
 *         - performNavAction(action): execute a navigation action (turn/step/strafe).
 *         - setCurrentTile: Setter<NavCoord> to programmatically set the active tile.
 *
 *   - listen: (fn: (event: NavActionEvent) => void) => void
 *       Subscribe to navigation actions (move/turn), receiving a payload with the
 *       action, intended target (for moves), and whether the move succeeded.
 *
 * @remarks
 * - Input handling:
 *     - Keyboard mapping (keyToActions): w/s/q/e/a/d -> StepForward/StepBack/StrafeLeft/StrafeRight/TurnLeft/TurnRight.
 *     - Initial keydown triggers one action immediately (OS auto-repeat is ignored via e.repeat).
 *     - Held-key repeats are implemented with a RAF-driven loop plus per-action
 *       timing stored in ACTION_TIMING, using performance.now() and a nextAllowedTime map.
 *     - handleKeyUp clears held state for the associated actions.
 *
 * - Camera override stack:
 *     - Overrides are pushed to an internal stack; the top-most override determines
 *       overridePos/overrideOri and its anim flag influences the animate signal.
 *     - createOverride returns a handle with commit/release helpers that may set
 *       the base animation flag when provided with an anim boolean.
 * 
 * - Errors:
 *     - setBase, setBasePos, and setBaseOri throw if called because this navigator
 *       enforces base camera driven by tile+direction and does not accept direct
 *       base overrides through those methods.
*/
export default function createTileNavigator(
    initialNM: NavMap
): {
    cameraControlSignals: CameraControlSignals,
    cameraController: CameraController,
    navController: NavController,
    navListen: (fn: (event: NavActionEvent) => void) => void
} {
    const [navMap, setNavMap] = createStore<NavMap>(initialNM);

    const [currentTile, setCurrentTile] = createSignal<NavCoord>(navMap.config.spawn);

    const [currentDirection, setCurrentDirection] = createSignal<Direction>(navMap.config.spawnDirection);
    const [currentYaw, setCurrentYaw] = createSignal(currentDirection() * 90);
    const [baseAnim, setBaseAnim] = createSignal(true);

    const { emit: emitNavAction, listen: listenNavAction } = createPayloadEmitter<NavActionEvent>();

    const tileOffset = createMemo(() => navMap.config.tileSize / 2);

    const base = createMemo(() => ({
        x: navMap.config.offset.x + tileOffset(),
        y: navMap.config.offset.y - navMap.config.playerHeight,
        z: navMap.config.offset.z + tileOffset()
    }));

    const cameraPositionForTile = (coord: NavCoord): XYZ => {
        const [tx, tz] = navCoordToTuple(coord);
        const size = navMap.config.tileSize;
        return [base().x + tx * size, base().y - (navMap.tiles[coord]?.height ?? 0), base().z + tz * size]
    }

    // Camera Override Stuff (Ripped from createCameraController)
    let nextOverrideID = 0;
    const [overrideStack, setOverrideStack] = createSignal<CameraOverride[]>([]);

    const restoreAnimAfterSnap = () => {
        requestAnimationFrame(() => {
            if (overrideStack().length === 0) setBaseAnim(true);
        });
    };

    const removeOverride = (id: number, snapBackNoAnim?: boolean) =>
        setOverrideStack(prev => {
            const next = prev.filter(ovr => ovr.id != id);
            if (next.length === 0) {
                if (snapBackNoAnim) {
                    // One-frame snap back to base, then restore animations.
                    setBaseAnim(false);
                    restoreAnimAfterSnap();
                } else {
                    setBaseAnim(true);
                }
            }
            return next;
        });

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
                const snapBackNoAnim = anim === false || (anim === undefined && ovr.anim === false);
                removeOverride(id, snapBackNoAnim);
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

    const targetForDir = (tile: NavCoord, dirIndex: Direction): NavCoord => {
        const [tx, tz] = navCoordToTuple(tile);
        const nx = tx + dirDX[dirIndex];
        const nz = tz + dirDZ[dirIndex];
        return `${nx},${nz}` as NavCoord;
    };

    const canMoveTo = (from: NavCoord, dirIndex: Direction, target: NavCoord) => {
        const current = navMap.tiles[from];
        if (!current || (current.edges & dirEdge[dirIndex])) return false;
        const targetTile = navMap.tiles[target];
        if (!targetTile || !targetTile.active || targetTile.occupied) return false;
        return true;
    };

    const tryMove = (dirIndex: Direction) => {
        const from = currentTile();
        const target = targetForDir(from, dirIndex);
        const success = canMoveTo(from, dirIndex, target);
        if (success) setCurrentTile(target);
        return { target, success, from };
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

        const originDirection = currentDirection();
        const origin = currentTile();

        // using & to modulo with bitmask, equiv to (dir + X) % 4
        switch (action) {
            case NavAction.TurnLeft:
                {
                    const nextDirection = ((currentDirection() + 1) & 3) as Direction;
                    setCurrentDirection(nextDirection);
                    setCurrentYaw(yaw => yaw + 90);
                    emitNavAction({ type: "turn", action, targetDirection: nextDirection, originDirection, origin });
                }
                break;

            case NavAction.TurnRight:
                {
                    const nextDirection = ((currentDirection() + 3) & 3) as Direction;
                    setCurrentDirection(nextDirection);
                    setCurrentYaw(yaw => yaw - 90);
                    emitNavAction({ type: "turn", action, targetDirection: nextDirection, originDirection, origin });
                }
                break;

            case NavAction.StepForward:
                {
                    const { target, success } = tryMove(currentDirection());
                    emitNavAction({ type: "move", action, target, success, originDirection, origin });
                }
                break;

            case NavAction.StepBack:
                {
                    const { target, success } = tryMove(((currentDirection() + 2) & 3) as Direction);
                    emitNavAction({ type: "move", action, target, success, originDirection, origin });
                }
                break;

            case NavAction.StrafeLeft:
                {
                    const { target, success } = tryMove(((currentDirection() + 1) & 3) as Direction);
                    emitNavAction({ type: "move", action, target, success, originDirection, origin });
                }
                break;

            case NavAction.StrafeRight:
                {
                    const { target, success } = tryMove(((currentDirection() + 3) & 3) as Direction);
                    emitNavAction({ type: "move", action, target, success, originDirection, origin });
                }
                break;
        }
    }

    listenNavAction(e => {
        if (e.type != 'move') return;
        if (!e.success) return;
        const tileStepType = navMap.tiles?.[e.target]?.stepSfx;
        if (!tileStepType) return;
        playStepSound(tileStepType);
    });

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
        base: currentBase(),
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
            setCurrentTile,
            navMap,
            setNavMap
        },
        navListen: listenNavAction
    };

}