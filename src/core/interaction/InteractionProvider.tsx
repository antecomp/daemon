import { ParentProps, createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { InteractionContextInt, InteractionMode, NUM_INTERACTION_MODES } from "./interactable.types";

const InteractionContext = createContext<InteractionContextInt>();
export const useInteractionContext = () => useContext(InteractionContext)!;

/**
 * Provides interaction-mode state to the scene, exposing helpers for reading and mutating the active mode.
 * Modes: `InteractionMode.Interact` (default click actions), `InteractionMode.Chat` (start dialogue), `InteractionMode.Observe` (inspect/look).
 * Users can cycle modes in UI or press number keys 1-3 to jump directly.
 */
export default function InteractionProvider(props: ParentProps) {

    const [currentInteractionMode, setCurrentInteractionMode] = createSignal<InteractionMode>(InteractionMode.Interact);
    const cycleInteractionMode = () => setCurrentInteractionMode(prev => (prev + 1) % NUM_INTERACTION_MODES);
    function changeInteractionModeWithKeybind(ev: KeyboardEvent) {
        let kn = Number(ev.key) - 1;
        if(0 <= kn && kn < NUM_INTERACTION_MODES) {
            setCurrentInteractionMode(kn);
        }
    }

    onMount(() => document.addEventListener('keydown', changeInteractionModeWithKeybind));
    onCleanup(() => document.removeEventListener('keydown', changeInteractionModeWithKeybind));
    
    return (
        <InteractionContext.Provider value={{
            currentInteractionMode, cycleInteractionMode, setCurrentInteractionMode
        }}>
            {props.children}
        </InteractionContext.Provider>
    )
}