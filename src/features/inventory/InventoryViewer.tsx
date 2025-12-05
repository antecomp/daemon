import Inventory from "@/core/inventory/inventory";
import { Item, ITEM_ICONS, ItemCategory } from "@/core/inventory/Items";
import { createEffect, createSignal, For, on, onCleanup, Show } from "solid-js";
import './inventory-viewer.css'
import stupid_corner from './assets/stupid_corner.png';
import ledge from './assets/tail.png';
import tail from './assets/tail.png';
import { popUILayer, pushUILayer } from "@/app/shell/layers/UILayerManager";
import ItemPreview from "./ItemPreview";
import { getRelativeOffset } from "@/shared/utils/documentPositionUtils";

/**
 * Sidebar Window - The Inventory Viewer.
 */
export default function InventoryViewer(props: {closeInventoryViewer: () => void}) {
    const [currentCategory, setCurrentCategory] = createSignal<ItemCategory>('misc');

    const categories: ItemCategory[] = ['misc', 'data', 'caches'];

    const gameRoot = () => document.getElementById("game-root") as HTMLElement | null;

    function showItemPreview(item: Item, id: number) {
        const trgt = itemRefs.get(id)
        if(!trgt) return; // failed to get ref;
        popUILayer('item-preview'); // Remove current preview if needed.
        const root = gameRoot();
        if (!root) return;
        const pos = getRelativeOffset(trgt, root);
        pos.x += 40;
        pos.y += 40;
        pushUILayer({
            id: 'item-preview',
            component: () => ItemPreview({item, pos, closeWindow: () => popUILayer('item-preview'), closeInventoryViewer: props.closeInventoryViewer})
        })
    }

    // Close preview if category changes.
    createEffect(on(currentCategory, () => popUILayer('item-preview')));
    // or if we close the file browser...
    onCleanup(() => popUILayer('item-preview'));

    // Used for getting position of the clicked item icon (to show preview)
    const itemRefs = new Map<number, HTMLElement>();

    return (
        <div class="inventory-viewer">
            <div class="inventory-viewer-items">
                <For each={Inventory.retrieveItems().filter(item => item.category == currentCategory())}>
                    {(item, i) =>
                        <div 
                            ref={el => itemRefs.set(i(), el)}
                            class="inventory-item" 
                            onClick={() => showItemPreview(item, i())}
                        >
                            <img src={ITEM_ICONS[item.icon]}/>
                            <p>{item.displayName}</p>
                        </div>
                    }
                </For>
            </div>
            <span><span></span><img src={stupid_corner}/></span>
            <div class="inventory-viewer-tabs">
                <div>/usr/arda/</div>
                <img src={ledge} class="tab-divider" />
                <For each={categories}>
                    {(category, index) => 
                    <>
                        <span 
                            class="inventory-viewer-tab" 
                            classList={{'inventory-viewer-tab-active': currentCategory() == category}}
                            onClick={() => setCurrentCategory(category)}
                        >
                            <p>{category}</p>
                        </span>
                        <Show when={index() !== categories.length - 1}>
                            <img src={ledge} class="tab-divider" onClick={() => setCurrentCategory(category)}/>
                        </Show>
                    </>
                    }
                </For>
                <img class="inventory-tabs-tail" src={tail} onClick={() => setCurrentCategory(categories[categories.length-1])}/>
            </div>
        </div>
    )
}