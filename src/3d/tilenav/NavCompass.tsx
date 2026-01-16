import { NavController } from "./createTileNavigator";
import cn from './assets/needle.png';

export default function NavCompass(props: {
    nc: NavController
}) {
    return (
        <div
            class="nav-compass"
            style={{
                'position': 'absolute',
                'top': '0px',
                'left': '0px',
                'color': 'white',
                'z-index': '1',
                'padding': '5px',
            }}
        >
            <img src={cn} width='20px'
                style={{
                    'rotate': props.nc.state().base.ori.yaw + 'deg',
                    'transition': 'rotate 0.5s ease'
                }}
            />
        </div>
    )
}