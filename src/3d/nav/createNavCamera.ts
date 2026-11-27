import { createEffect } from "solid-js";
import { CameraController, SwayLimits } from "../cam/cam.types";
import createCamera from "../cam/createCamera";
import { NavState } from "./createNavState";
import { NavCoord, NavMap } from "../tilenav/tilenav.types";
import { XYZ } from "@/shared/types/3d.types";
import { navCoordToTuple } from "../tilenav/tilenav.utils";

function cameraPositionForTile(tile: NavCoord, nm: NavMap): XYZ {
    const [tx, tz] = navCoordToTuple(tile);
    const size = nm.config.tileSize
    const base = {
        x: nm.config.offset.x,
        y: nm.config.offset.y - nm.config.playerHeight,
        z: nm.config.offset.z
    }
    return [
        base.x + tx * size,
        base.y - (nm.tiles[tile]?.height ?? 0),
        base.z + tz * size 
    ]
}

export default function createNavCamera(nav: NavState, sway: SwayLimits): Omit<CameraController, 'goto'> {
    const cam = createCamera({sway});

    createEffect(() => {
        const { tile, facing, warped } = nav.position();
        cam.goto(
            { pos: cameraPositionForTile(tile, nav.navmap), yaw: facing * 90 },
            warped ? 'cut' : 'ease',
        );
    });

    return {
        Camera: cam.Camera,
        override: cam.override,
        isOverridden: cam.isOverridden,
        currentStack: cam.currentStack
    }
}