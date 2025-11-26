import { Item } from "@/core/inventory/Items";
import { Point } from "@/shared/types/3d.types";

import swindow_button_frame from "@/app/shell/sidebar/assets/swindow_button_frame.png"
import swindow_slopcorner from "@/app/shell/sidebar/assets/swindow-slopborder.png"
import swindow_button from "@/app/shell/sidebar/assets/swindow_button.png"
import swindow_bot_corner from "@/app/shell/sidebar/assets/swindow_bot_corner.png"
import top_corner from './assets/preview-top-corner.png'

import './item-preview.css'

export default function ItemPreview(props: {
    item: Item
    pos: Point
    closeWindow: () => void;
}) {
    return (
        <div
            style={{
                position: 'absolute',
                top: `${props.pos.y}px`,
                left: `${props.pos.x}px`
            }}
            class='item-preview-window'
        >
            <div class='itemprev-hb'>
                <img class="itemprev-topcorner" src={top_corner} />
                <span class="itemprev-title">FILE PREVIEW</span>
                <img src={swindow_button_frame} />
                <img
                    class="itemprev-button"
                    src={swindow_button}
                    onClick={props.closeWindow}
                />
            </div>
            <div class="itemprev-hm">
                <span />
                <img src={swindow_slopcorner} />
            </div>
            <div class="itemprev-content">
                {props.item.previewComponent({})}
                BUTTONS TO DO STUFF GO HERE LATER :D
            </div>
            <footer>
                <span />
                <img src={swindow_bot_corner} />
            </footer>
        </div>
    )
}