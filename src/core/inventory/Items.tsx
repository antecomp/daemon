import { Component } from "solid-js"

export type ItemCategory = "data" | "caches" | "misc"

export interface Item {
    // key: string, // is this needed?
    displayName: string,
    icon?: string; // TODO: make a table of icon names to asseturls later.
    category: ItemCategory;
    previewComponent: Component;
    uploadable: boolean;
    action?: () => void;
}

export const ITEM_REGISTRY = {
    test: {
        //key: 'test',
        category: 'misc',
        displayName: 'test1',
        previewComponent: () => <p>test</p>,
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
    }
} as const satisfies Record<string, Item>

export type ItemKey = keyof typeof ITEM_REGISTRY;