import Inventory from "@/core/inventory/inventory";
import { ItemCategory } from "@/core/inventory/Items";
import { createSignal, For, Show } from "solid-js";
import default_item_icon from '../../assets/ui/icons/items/default_icon.png';
import './inventory-viewer.css'
import stupid_corner from './assets/stupid_corner.png';
import ledge from './assets/tail.png';
import tail from './assets/tail.png';

export default function InventoryViewer() {
    const [currentCategory, setCurrentCategory] = createSignal<ItemCategory>('misc');

    const categories: ItemCategory[] = ['misc', 'data', 'caches'];

    return (
        <div class="inventory-viewer">
            <div class="inventory-viewer-items">
                <For each={Inventory.retrieveItems().filter(item => item.category == currentCategory())}>
                    {item =>
                        <div class="inventory-item">
                            <img src={default_item_icon}/>
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