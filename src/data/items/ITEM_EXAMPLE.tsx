import { Item } from "@/core/inventory/Items";
import ksngr from '@/assets/artwork/dæmons/kissinger.png';

const ITEM_EXAMPLE: Item = {
    category: 'misc',
    icon: 'default',
    displayName: 'ksngr',
    previewName: 'Kissinger',
    previewComponent() {
        return (
            <div>
                <img src={ksngr} />
            </div>
        );
    },
    uploadable: true,
}

export default ITEM_EXAMPLE;