import { createSignal } from "solid-js";
import { ITEM_DB, ItemKey } from "./Items";

// Consider changing this to use a set or set-like methods, to prevent duplicate items.

const [itemsList, setItemsList] = createSignal<ItemKey[]>(['test', 'test2', 'test3']);

const Inventory = {
    currentItemsList: () => itemsList(),
    addItem: (item: ItemKey) => setItemsList(prev => [...prev, item]),
    removeItem: (item: ItemKey) => setItemsList(prev => prev.filter(i => i === item)),
    retrieveItems: () => itemsList().map(itemName => ITEM_DB[itemName])
}

export default Inventory;