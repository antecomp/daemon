import { AssetURL } from "@/shared/types/misc.types";
import { Component } from "solid-js"

export interface Item {
    // key: string, // is this needed?
    displayName: string,
    icon?: AssetURL;
    previewComponent: Component;
    uploadable: boolean;
    action?: () => void;
}

export const ITEM_DB = {
    test: {
        //key: 'test',
        displayName: 'Some Test Item',
        previewComponent: () => <p>test</p>,
        uploadable: false
    }
} as const satisfies Record<string, Item>

export type ItemKey = keyof typeof ITEM_DB;