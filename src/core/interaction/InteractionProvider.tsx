import { ParentProps, createContext, createSignal, onCleanup, onMount, useContext } from "solid-js";
import { InteractionContextInt, InteractionMode } from "./interactable.types";

const InteractionContext = createContext<InteractionContextInt>();
export const useInteractionContext = () => useContext(InteractionContext)!;

/**
 * Interactions in DG are composed of 3 unique modes: "Interact", "Chat", "Observe."
 * This wrapper provides the context to access state regarding the current interaction mode of the game
 *  TODO: Expand this documentation. Add documentation to the context itself.
 */
export default function InteractionProvider(props: ParentProps) {

    const [currentInteractionMode, setCurrentInteractionMode] = createSignal<InteractionMode>(InteractionMode.Interact);
    const cycleInteractionMode = () => setCurrentInteractionMode(prev => (prev + 1) % 3);
    function changeInteractionModeWithKeybind(ev: KeyboardEvent) {
        let kn = Number(ev.key) - 1;
        if(0 <= kn && kn <= 2) {
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