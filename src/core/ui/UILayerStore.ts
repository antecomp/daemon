import { createMemo, createSignal } from "solid-js";
import { MainUILock, UILayer, UILockState } from "./ui-layers.types";

const [uilayers, setUILayers] = createSignal<UILayer[]>([]);

/**
 * Adds a new UI layer to the existing stack of UI layers.
 *
 * @param layer - The UI layer to be added to the stack.
 */
export function pushUILayer(layer: UILayer) {
    setUILayers(prev => [...prev, layer]);
}

/**
 * Removes the top UI layer from the stack. If an ID is provided, removes the layer with that ID.
 *
 * @param id - The ID of the UI layer to be removed. If not provided, removes the top layer.
 */
export function popUILayer(id?: string) {
    setUILayers(prev => id ? prev.filter(l => l.id !== id) : prev.slice(0, -1));
}

/**
 * Clears all UI layers from the stack.
 */
export function clearUILayers() {
    setUILayers([]);
}

/**
 * Retrieves the current stack of UI layers.
 *
 * @returns A signal containing the current stack of UI layers.
 */
export function getUILayers() {
    return uilayers;
}

//////////////////////////////////////////////////////////////////////////////////////////

const sceneLocked = createMemo(() =>
    uilayers().some(l => l.lock == MainUILock.All || l.lock == MainUILock.Scene)
)

const sidebarLocked = createMemo(() =>
    uilayers().some(l => l.lock == MainUILock.All || l.lock == MainUILock.Sidebar)
)

const uiLocked = createMemo(() => 
    uilayers().some(l => l.lock == MainUILock.All)
);

/**
 * Returns the lock state of the main UI components (memos).
 */
export function getLockState(): UILockState {
    return { sceneLocked, sidebarLocked, uiLocked };
}