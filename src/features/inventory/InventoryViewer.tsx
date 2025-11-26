import Inventory from "@/core/inventory/inventory";
import { ItemCategory } from "@/core/inventory/Items";
import { createSignal, For } from "solid-js";
import default_item_icon from '../../assets/ui/icons/items/default_icon.png';
import './inventory-viewer.css'
import stupid_corner from './assets/stupid_corner.png';
import ledge from './assets/stupid_corner.png';
import tail from './assets/tail.png';

export default function InventoryViewer() {
    const [currentCategory, setCurrentCategory] = createSignal<ItemCategory>('misc');

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
            <span><img src={stupid_corner}/></span>
            <div class="inventory-viewer-tabs">
                <div>/usr/arda/</div>
                <For each={['misc', 'data', 'caches'] satisfies ItemCategory[]}>
                    {(category) => 
                        <span 
                            class="inventory-viewer-tab" 
                            classList={{'inventory-viewer-tab-active': currentCategory() == category}}
                            onClick={() => setCurrentCategory(category)}
                        >
                           <img src={ledge} onClick={() => setCurrentCategory(category)}/>
                           <p onClick={() => setCurrentCategory(category)}>{category}</p>
                        </span>
                    }
                </For>
                <img src={tail}/>
            </div>
        </div>
    )
}