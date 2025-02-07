import msi from '@/assets/ui/InteractionModePicker/msi.png'
import mso from '@/assets/ui/InteractionModePicker/mso.png'
import msc from '@/assets/ui/InteractionModePicker/msc.png'
import { createSignal, onCleanup, onMount } from 'solid-js'
import { Vector2 } from 'three'

export enum InteractionMode {
    Interact,
    Chat,
    Observe,
}

/**
 * Map of interaction modes to a CB to run for handling that interaction type.
 * Used by YBillboard and Interactable
 */
export type InteractionMap = {
    [mode in InteractionMode]?: (uv?: Vector2) => void
} | [(uv?: Vector2) => void, (uv?: Vector2) => void, (uv?: Vector2) => void]

const _interactionModeToImage = (idx: InteractionMode) => {
    return [msi, msc, mso][idx];
}

export const [currentInteractionMode, setCurrentInteractionMode] = createSignal<InteractionMode>(InteractionMode.Interact);

export default function InteractionModePicker() {

    // Change interaction mode by pressing 1, 2, or 3...
    const handleKeyPress = (ev: KeyboardEvent) => {
        let kn = Number(ev.key) - 1;
        if(0 <= kn && kn <= 2) {
            setCurrentInteractionMode(kn);
        }
    };

    onMount(() => {
        document.addEventListener('keydown', handleKeyPress);
    })

    onCleanup(() => {
        document.removeEventListener('keydown', handleKeyPress);
    })

    return (
        <div id="intmode-picker">
            <img id="imodebuttons" src={_interactionModeToImage(currentInteractionMode())} useMap="#imode-map" />
            <map name="imode-map">
                <area 
                    shape="poly" 
                    coords=" 0,0, 0,80, 80,80"
                    onClick={() => setCurrentInteractionMode(InteractionMode.Interact)}
                    style={{cursor: "pointer"}}
                />
                <area 
                    shape="poly" 
                    coords="0,0, 80,0, 39,39" 
                    onClick={() => setCurrentInteractionMode(InteractionMode.Chat)}
                    style={{cursor: "pointer"}}
                />
                <area 
                    shape="poly" 
                    coords="40,40, 80,0, 80,80" 
                    onClick={() => setCurrentInteractionMode(InteractionMode.Observe)}
                    style={{cursor: "pointer"}}
                />
            </map>
        </div>
    )
}