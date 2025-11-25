import { AssetURL } from "@/shared/types/misc.types";
import { Component } from "solid-js"

export type ItemCategory = "data" | "caches" | "misc"

export interface Item {
    // key: string, // is this needed?
    displayName: string,
    icon?: AssetURL;
    category: ItemCategory;
    previewComponent: Component;
    uploadable: boolean;
    action?: () => void;
}

export const ITEM_DB = {
    test: {
        //key: 'test',
        category: 'misc',
        displayName: 'Some Test Item',
        previewComponent: () => <p>test</p>,
        uploadable: false
    },
    test2: {
        //key: 'test',
        category: 'data',
        displayName: 'Another Test Item',
        previewComponent: () => <p>test</p>,
        uploadable: false
    },
    test3: {
        displayName: "Third test item",
        category: 'caches',
        previewComponent: () => <p>test</p>,
        uploadable: false
    }
} as const satisfies Record<string, Item>

export type ItemKey = keyof typeof ITEM_DB;