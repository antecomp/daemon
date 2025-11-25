import { createSignal } from "solid-js";
import { ITEM_REGISTRY, ItemKey } from "./Items";

// Consider changing this to use a set or set-like methods, to prevent duplicate items.

const [itemsList, setItemsList] = createSignal<ItemKey[]>(['test', 'test2', 'test3']);

const Inventory = {
    currentItemsList: () => itemsList(),
    addItem: (item: ItemKey) => setItemsList(prev => [...prev, item]),
    containsItem: (item: ItemKey) => itemsList().includes(item),
    removeItem: (item: ItemKey) => setItemsList(prev => prev.filter(i => i === item)),
    retrieveItems: () => itemsList().map(itemName => ITEM_REGISTRY[itemName])
}

export default Inventory;


// Consider making the "upload" feature an interaction mode
// could easily change the IModePicker to show a little upload icon to also indicate what we're doing
// so don't worry about the extra state
// should allow Interactable and others to easily attach on an upload Interaction.