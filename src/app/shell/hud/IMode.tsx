import ipi from "./assets/ip_i.png"
import ipo from "./assets/ip_o.png"
import ipc from "./assets/ip_c.png"
import { InteractionMode } from "@/core/interaction/interactable.types"
import { useInteractionContext } from "@/core/interaction/InteractionProvider"

export default function IModePicker() {

    const {currentInteractionMode, setCurrentInteractionMode} = useInteractionContext();

    const interactionModeImage = () => [ipi, ipc, ipo][currentInteractionMode()]

    return (
        <div id="imode-picker">
            <img src={interactionModeImage()} useMap="#imode-map"/>
            <map name="imode-map">
                <area 
                    shape="poly" 
                    coords=" 0,0, 0,80, 80,80"
                    onClick={() => setCurrentInteractionMode(InteractionMode.Interact)}
                />
                <area 
                    shape="poly" 
                    coords="0,0, 80,0, 39,39" 
                    onClick={() => setCurrentInteractionMode(InteractionMode.Chat)}
                />
                <area 
                    shape="poly" 
                    coords="40,40, 80,0, 80,80" 
                    onClick={() => setCurrentInteractionMode(InteractionMode.Observe)}
                />
            </map>
        </div>
    )
}