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
    /** id - A unique identifier for the UI layer. */
    id: string;
    /**  component - A function that returns the JSX element for the UI layer. */
    component: () => JSX.Element;
    /** metaLayer - (Optional) The meta layer of the UI layer, determining its stacking order. */
    metaLayer?: MetaLayer;
    /** lock - (Optional) The lock state associated with the UI layer. */
    lock?: 'sidebar' | 'scene' | 'all';
    /** (Optional) Whether interactions with layers behind this one are blocked. */
    blockBehind?: boolean;
    /** style - (Optional) Custom CSS properties for the UI layer (containing div). */
    style?: JSX.CSSProperties;
    /** classList - Additional CSS classes to apply to the UI layer (containing div) */
    classList?: JSX.CustomAttributes<HTMLDivElement>['classList']
}