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
    lock?: 'sidebar' | 'scene' | 'all';
    blockBehind?: boolean;
    style?: JSX.CSSProperties;
}