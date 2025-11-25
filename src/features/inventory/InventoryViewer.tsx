import Inventory from "@/core/inventory/inventory";
import { ItemCategory } from "@/core/inventory/Items";
import { createSignal, For } from "solid-js";

export default function InventoryViewer() {
    const [currentCategory, setCurrentCategory] = createSignal<ItemCategory>('misc');

    return (
        <div class="inventory-viewer">
            <div class="inventory-viewer-items">
                <For each={Inventory.retrieveItems().filter(item => item.category == currentCategory())}>
                    {item =>
                        <div class="inventory-item">
                            {item.displayName}
                        </div>
                    }
                </For>
            </div>
            <div class="inventory-viewer-tabs">
                <For each={['misc', 'data', 'caches'] satisfies ItemCategory[]}>
                    {category => 
                        <span onClick={() => setCurrentCategory(category)}>{category}</span>
                    }
                </For>
            </div>
        </div>
    )
}