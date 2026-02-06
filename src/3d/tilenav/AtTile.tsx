import { ParentProps } from "solid-js";
import { NavController } from "./createTileNavigator";
import { NavCoord, NavMap } from "./tilenav.types";
import { getWSPositionOfTile } from "./tilenav.utils";

// Hey! Just make the children offset their y to get the height right. Don't make it the responsibility here.
// Also note that you can totally do half tiles (i.e 0.5,0.5) to move within the tile dimensions here!


interface OnTileProps extends ParentProps {
    pos: NavCoord,
    nm: NavMap,
    nc: NavController
}

export default function AtTile(props: OnTileProps) {
    return <lume-element3d
        align-point="0.5 0.5"
        position={getWSPositionOfTile(props.pos, props.nm).join(' ')}
    >
        {props.children}
    </lume-element3d>
}