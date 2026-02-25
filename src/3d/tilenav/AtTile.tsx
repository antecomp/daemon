import { createEffect, onCleanup, ParentProps } from "solid-js";
import { NavController } from "./createTileNavigator";
import { NavCoord, NavMap } from "./tilenav.types";
import { getWSPositionOfTile, navCoordToTuple, tupleToNavCoord } from "./tilenav.utils";

// Hey! Just make the children offset their y to get the height right. Don't make it the responsibility here.
// Also note that you can totally do half tiles (i.e 0.5,0.5) to move within the tile dimensions here!


interface OnTileProps extends ParentProps {
    pos: NavCoord,
    nm: NavMap,
    nc: NavController,
    onWalkInto?: () => void
}

/** TODO: Document */
export default function AtTile(props: OnTileProps) {

    let releaseTileOccupancy: (() => void) | null = null;
    
    // Should run whenever props changes?
    createEffect(() => {
        // Release tile that was previously occupied
        releaseTileOccupancy && releaseTileOccupancy();

        // Occupy new tile, update release for new tile.
        releaseTileOccupancy = props.nc.occupyTile(
            // Round fractional pos (i.e 1.5,1.3) to integer tile coords.
            tupleToNavCoord(
                navCoordToTuple(props.pos).map(e => Math.round(e)) as [number, number]
            )
        );
    });

    props.nc.navListen((e) => {
        if(e.type == 'move' && e.target == props.pos) props.onWalkInto?.();
    });

    onCleanup(() => {
        releaseTileOccupancy && releaseTileOccupancy();
    })

    return <lume-element3d
        align-point="0.5 0.5"
        position={getWSPositionOfTile(props.pos, props.nm).join(' ')}
    >
        {props.children}
    </lume-element3d>
}