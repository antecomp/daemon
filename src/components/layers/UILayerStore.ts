import { createMemo, createSignal } from "solid-js";
import { MainUILock, UILayer, UILockState } from "./ui-layers.types";

const [uilayers, setUILayers] = createSignal<UILayer[]>([]);

export function pushUILayer(layer: UILayer) {
    setUILayers(prev => [...prev, layer]);
}

export function popUILayer(id?: string) {
    setUILayers(prev => id ? prev.filter(l => l.id !== id) : prev.slice(0, -1));
}

export function clearUILayers() {
    setUILayers([]);
}

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

export function getLockState(): UILockState {
    return { sceneLocked, sidebarLocked, uiLocked };
}