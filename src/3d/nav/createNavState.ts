import { Accessor, createSignal } from "solid-js";
import { NavCoord, NavMap } from "../tilenav/tilenav.types";
import { createStore, type SetStoreFunction } from "solid-js/store";

export type NavState = {
    navmap: NavMap,
    setNm: SetStoreFunction<NavMap>,
    //occupy stuff todo
    moveTo: (tile?: NavCoord, facing?: number) => void;
    warpTo: (tile?: NavCoord, facing?: number) => void;
    position: Accessor<NavPlayerPosition>
}

export type NavPlayerPosition = {
    tile: NavCoord,
    facing: number,
    /** Whether to ease or jump to tile */
    warped?: boolean
}

export default function createNavState(init: NavMap): NavState {
    const [navmap, setNm] = createStore<NavMap>(structuredClone(init));
    const [position, setPosition] = createSignal<NavPlayerPosition>({
        tile: init.config.spawn,
        facing: init.config.spawnDirection,
        warped: true
    });

    // todo: get a feel for if you just want to combine these and have warp as a param.
    const moveTo = (tile: NavCoord = position().tile, facing = position().facing) => {
        setPosition({tile, facing, warped: false});
    }

    const warpTo = (tile: NavCoord = position().tile, facing = position().facing) => {
        setPosition({tile, facing, warped: true})
    }

    return {
        navmap, setNm, moveTo, warpTo, position
    }
}