import Sidebar from "./ui/SideBar/Sidebar.tsx"
import SceneContainer from "./ui/SceneContainer"
import IModePicker from "./ui/IMode"
import EventLog from "./ui/EventLog"

import './main.css'
import vl_badge from './assets/vl_badge.png'
import UILayerHost from "@/layers/UILayerHost"

/* Warning that these IDs are used for createTooltips portal / rendered scale calculations!*/
export default function Main() {
    return (
        <main id="game-root">
            <Sidebar/>
            <SceneContainer/>
            <img src={vl_badge} />
            <div id="bottom-bar">
                <EventLog/>
                <IModePicker/>
            </div>
            <UILayerHost/>
            {/* targeted by Portals for modals, tooltips, etc. Always top level.
                Doing it this way so whatever we spawn with Portals can inherit 
                positioning/scaling of game body. (whereas mounting to body may cause issues)
            */}
            <div id="modal-root"/>
        </main>
    )
}