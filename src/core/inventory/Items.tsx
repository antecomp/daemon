import ITEM_DV_MOD from "@/data/items/ITEM_DV_MOD";
import ITEM_EXAMPLE from "@/data/items/ITEM_EXAMPLE";
import { Component } from "solid-js"
import { AssetURL } from "@/shared/types/misc.types";
import { playTextOverlay } from "@/features/text-overlay/TextOverlay";
import decrypt_textscene from "@/scenes/TheGem/data/decrypt_textscene";
import { ITEM_ICONS } from "./itemIcons";
import ITEM_RELIC from "@/data/items/ITEM_RELIC";

export type ItemCategory = "data" | "caches" | "misc"

/**
 * Describes a single inventory item and how it should be presented and interacted with in the UI.
 *
 * @property displayName - Required human-readable name shown in inventory viewer.
 * @property previewName - Optional alternate name to display inside previewer UI (when different from displayName). Used for expanded names.
 * @property icon - Key of ITEM_ICONS that identifies the icon to render for this item.
 * @property category - Classification of the item used for grouping/filtering (type: ItemCategory).
 * @property previewComponent - A UI component used to render a preview of the item inside a viewer.
 * @property uploadable - (TO IMPLEMENT): If the item can be "uploaded" (used upon scene objects)
 * @property action (optional) - callback to run when the item is used.
 * @property actionShouldCloseViewer - When true and an action is invoked from within a previewer/viewer,
 *                                     the viewer should be closed when the action starts.
 */
export interface Item {
    // key: string, // is this needed?
    displayName: string,
    previewName?: string, // alternatively show a different name in the previewer
    icon: AssetURL,
    category: ItemCategory;
    previewComponent: Component;
    uploadable: boolean;
    action?: () => void;
    actionShouldCloseViewer?: boolean
}

/**
 * Registry of all game items. New items should be registered here.
 * Is a simple record of an item key to an Item instance.
 */
export const ITEM_REGISTRY = {
    test: {
        category: 'misc',
        displayName: 'test1',
        icon: ITEM_ICONS.default,
        previewComponent: () => <p style={{width: '300px'}}>some item component</p>,
        uploadable: false
    },
    test2: {
        category: 'data',
        displayName: 'a2',
        icon: ITEM_ICONS.default,
        previewComponent: () => <p>test</p>,
        uploadable: false
    },
    test3: {
        displayName: "333",
        icon: ITEM_ICONS.default,
        category: 'caches',
        previewComponent: () => <p>Woah</p>,
        uploadable: false,
        action() {playTextOverlay(decrypt_textscene)}
    },
    dv_mod: ITEM_DV_MOD,
    example: ITEM_EXAMPLE,
    relic: ITEM_RELIC
} as const satisfies Record<string, Item>

export type ItemKey = keyof typeof ITEM_REGISTRY;