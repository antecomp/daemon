import { Item } from "@/core/inventory/Items";
import { Point } from "@/shared/types/3d.types";

import swindow_button_frame from "@/app/shell/sidebar/assets/swindow_button_frame.png"
import swindow_slopcorner from "@/app/shell/sidebar/assets/swindow-slopborder.png"
import swindow_button from "@/app/shell/sidebar/assets/swindow_button.png"
import top_corner from './assets/preview-top-corner.png'

import './item-preview.css'
import buttons_divider from './assets/prev_buttons_divider.png';
import { Show } from "solid-js";
import upload_icon from './assets/upload_icon.png';
import use_icon from './assets/use_icon.png';

/**
 * Popup preview window for items.
 */
export default function ItemPreview(props: {
    item: Item
    pos: Point
    closeWindow: () => void;
    closeInventoryViewer: () => void;
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
            </div>
            <footer>
                <span class="itemprev-item-name">
                    {props.item.previewName ?? props.item.displayName}
                </span>
                <img src={buttons_divider} class='btns-divider' />
                <span class="itemprev-buttons">
                    <Show when={props.item.action != undefined}>
                        <p onClick={() => {
                            props.item.action!();
                            props.item.actionShouldCloseViewer && props.closeInventoryViewer();
                        }}
                        >
                            <img src={use_icon} />
                            USE
                        </p>
                    </Show>
                    <Show when={props.item.uploadable}>
                        <p>
                            <img src={upload_icon} />
                            UPLOAD
                        </p>
                    </Show>
                </span>
            </footer>
        </div>
    )
}