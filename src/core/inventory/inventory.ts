import { createSignal } from "solid-js";
import { ITEM_REGISTRY, ItemKey } from "./Items";
import { addLogMessage } from "@/app/shell/hud/EventLog";

// TODO: Consider changing this to use a set or set-like methods, to prevent duplicate items.

const [itemsList, setItemsList] = createSignal<ItemKey[]>(['example', 
    //'dv_mod'
]);


/** Player Inventory Manager
 * @method currentItemsList - Returns current item *keys*.
 * @method addItem - Adds a new item, by key, to the inventory.
 * @method containsItem - Check if the player has some item, by key, in their inventory.
 * @method removeItem - Removes an item, by key, from the inventory.
 * @method retriveItems - Returns an array of `Items` (actual item metadata) 
 *                        for what currently is in the players inventory.
 */
const Inventory = {
    currentItemsList: () => itemsList(),
    addItem: (item: ItemKey, silent?: boolean) => {
        setItemsList(prev => [...prev, item])
        if(!silent) {
            addLogMessage(`${ITEM_REGISTRY[item].displayName} has been saved to /usr/arda/${ITEM_REGISTRY[item].category}/`)
        }
    },
    containsItem: (item: ItemKey) => itemsList().includes(item),
    removeItem: (item: ItemKey) => setItemsList(prev => prev.filter(i => i != item)),
    retrieveItems: () => itemsList().map(itemName => ITEM_REGISTRY[itemName])
}

export default Inventory;


// TODO: Consider making the "upload" feature an interaction mode
// could easily change the IModePicker to show a little upload icon to also indicate what we're doing
// so don't worry about the extra state
// should allow Interactable and others to easily attach on an upload Interaction.