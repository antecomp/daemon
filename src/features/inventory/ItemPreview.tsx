import { Item } from "@/core/inventory/Items";
import { Point } from "@/shared/types/3d.types";

export default function ItemPreview(props: {
    item: Item
    pos: Point
}) {
    return <div 
                style={{
                    background: 'red',
                    position: 'absolute',
                    top: `${props.pos.y}px`,
                    left: `${props.pos.x}px`
                }}
            >
                {props.item.displayName}
            </div>
}