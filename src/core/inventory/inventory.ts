import { createSignal } from "solid-js";
import { ITEM_DB, ItemKey } from "./Items";

const [itemsList, setItemsList] = createSignal<ItemKey[]>([]);

const Inventory = {
    currentItemsList: () => itemsList(),
    addItem: (item: ItemKey) => setItemsList(prev => [...prev, item]),
    removeItem: (item: ItemKey) => setItemsList(prev => prev.filter(i => i === item)),
    retrieveItems: () => itemsList().map(itemName => ITEM_DB[itemName])
}

export default Inventory;