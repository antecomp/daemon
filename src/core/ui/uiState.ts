import { createSignal } from "solid-js";

export enum UIState {
    Normal,
    Dialogue,
    Battle
    // Overlay, cutscene etc...
}

const [currentUIState, setUIState] = createSignal<UIState>(UIState.Normal);

export {currentUIState, setUIState}