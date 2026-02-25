import { Item, ITEM_ICONS } from "@/core/inventory/Items";
import ksngr from '@/assets/artwork/dæmons/kissinger.png';

const ITEM_EXAMPLE: Item = {
    category: 'misc',
    icon: ITEM_ICONS.default,
    displayName: 'ksngr',
    previewName: 'Kissinger',
    previewComponent() {
        return (
            <div>
                <img src={ksngr} />
            </div>
        );
    },
    action() {
        
    },
    uploadable: true,
}

export default ITEM_EXAMPLE;