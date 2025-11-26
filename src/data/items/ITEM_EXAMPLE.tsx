import { Item } from "@/core/inventory/Items";
import ksngr from '@/assets/artwork/dæmons/kissinger.png';

const ITEM_EXAMPLE: Item = {
    category: 'misc',
    displayName: 'ksngr',
    previewName: 'Kissinger',
    previewComponent() {
        return (
            <div>
                <img src={ksngr} />
            </div>
        );
    },
    uploadable: false
}

export default ITEM_EXAMPLE;