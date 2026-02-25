import default_item_icon from '@/assets/ui/icons/items/default_icon.png';
import { AssetURL } from '@/shared/types/misc.types';


export const ITEM_ICONS = {
    'default': default_item_icon,
} as const satisfies Record<string, AssetURL>