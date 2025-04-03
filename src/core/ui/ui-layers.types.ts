import { JSX } from "solid-js";

/**
 * Represents the meta layer of a UI component.
 * Determines the stacking order of the UI layer.
 * 
 * - `bottom`: The lowest layer.
 * - `middle`: The middle layer.
 * - `top`: The highest layer.
 */
export type MetaLayer = 'bottom' | 'middle' | 'top';

/**
 * Enum representing the main UI lock states.
 * Used to lock specific parts of the UI.
 * 
 * - `Sidebar`: Locks the sidebar.
 * - `Scene`: Locks the scene.
 * - `All`: Locks the entire UI.
 */
export enum MainUILock {
    Sidebar,
    Scene,
    All
}

/**
 * Represents a UI layer with its associated properties.
 * 
 * @property id - A unique identifier for the UI layer.
 * @property component - A function that returns the JSX element for the UI layer.
 * @property metaLayer - (Optional) The meta layer of the UI layer, determining its stacking order.
 * @property lock - (Optional) The lock state associated with the UI layer.
 * @property blockBehind - (Optional) Whether interactions with layers behind this one are blocked.
 * @property style - (Optional) Custom CSS properties for the UI layer (containing div).
 */
export type UILayer = {
    id: string;
    component: () => JSX.Element;
    metaLayer?: MetaLayer;
    lock?: MainUILock;
    blockBehind?: boolean;
    style?: JSX.CSSProperties;
}