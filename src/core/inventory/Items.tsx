import ITEM_DV_MOD from "@/data/items/ITEM_DV_MOD";
import ITEM_EXAMPLE from "@/data/items/ITEM_EXAMPLE";
import { Component } from "solid-js"
import default_item_icon from '@/assets/ui/icons/items/default_icon.png';
import { AssetURL } from "@/shared/types/misc.types";

export const ITEM_ICONS = {
    'default': default_item_icon,
} as const satisfies Record<string, AssetURL>

export type ItemCategory = "data" | "caches" | "misc"

export interface Item {
    // key: string, // is this needed?
    displayName: string,
    previewName?: string, // alternatively show a different name in the previewer
    icon: keyof typeof ITEM_ICONS; // TODO: make a table of icon names to asseturls later.
    category: ItemCategory;
    previewComponent: Component;
    uploadable: boolean;
    action?: () => void;
    actionShouldCloseViewer?: boolean
}

export const ITEM_REGISTRY = {
    test: {
        category: 'misc',
        displayName: 'test1',
        icon: 'default',
        previewComponent: () => <p style={{width: '300px'}}>some item component</p>,
        uploadable: false
    },
    test2: {
        category: 'data',
        displayName: 'a2',
        icon: 'default',
        previewComponent: () => <p>test</p>,
        uploadable: false
    },
    test3: {
        displayName: "333",
        icon: 'default',
        category: 'caches',
        previewComponent: () => <p>test</p>,
        uploadable: false,
    },
    dv_mod: ITEM_DV_MOD,
    example: ITEM_EXAMPLE
} as const satisfies Record<string, Item>

export type ItemKey = keyof typeof ITEM_REGISTRY;