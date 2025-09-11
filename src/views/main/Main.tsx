import Sidebar from "./ui/SideBar/Sidebar.tsx"
import SceneContainer from "./ui/SceneContainer"
import IModePicker from "./ui/IMode"
import EventLog from "./ui/EventLog"

import './main.css'
import vl_badge from './assets/vl_badge.png'
import UILayerHost from "@/layers/UILayerHost"

export default function Main() {
    return (
        <main>
            <Sidebar/>
            <SceneContainer/>
            <img src={vl_badge} />
            <div id="bottom-bar">
                <EventLog/>
                <IModePicker/>
            </div>
            <UILayerHost/>
        </main>
    )
}