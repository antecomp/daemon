import ITEM_DV_MOD from "@/data/items/ITEM_DV_MOD";
import ITEM_EXAMPLE from "@/data/items/ITEM_EXAMPLE";
import { Component } from "solid-js"

export type ItemCategory = "data" | "caches" | "misc"

export interface Item {
    // key: string, // is this needed?
    displayName: string,
    previewName?: string, // alternatively show a different name in the previewer
    icon?: string; // TODO: make a table of icon names to asseturls later.
    category: ItemCategory;
    previewComponent: Component;
    uploadable: boolean;
    action?: () => void;
    actionShouldCloseViewer?: boolean
}

export const ITEM_REGISTRY = {
    test: {
        //key: 'test',
        category: 'misc',
        displayName: 'test1',
        previewComponent: () => <p style={{width: '300px'}}>some item component</p>,
        uploadable: false
    },
    test2: {
        //key: 'test',
        category: 'data',
        displayName: 'a2',
        previewComponent: () => <p>test</p>,
        uploadable: false
    },
    test3: {
        displayName: "333",
        category: 'caches',
        previewComponent: () => <p>test</p>,
        uploadable: false,
    },
    dv_mod: ITEM_DV_MOD,
    example: ITEM_EXAMPLE
} as const satisfies Record<string, Item>

export type ItemKey = keyof typeof ITEM_REGISTRY;