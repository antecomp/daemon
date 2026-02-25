import { For } from "solid-js";
import { getUILayers } from "./UILayerManager";
import './ui-layers.css'
import { BOTTOMBAR_HEIGHT } from "@/config/ui.config";

export default function UILayerHost() {

    const layers = getUILayers();

    return (
        <div id="ui-layers-host">
            <For each={layers()}>
                {(layer, index) => (
                    <div
                        class="ui-layer"
                        style={{
                            'z-index': {'default': 50, 'bottom': 100, 'middle': 200, 'top': 300}[layer?.metaLayer ?? 'default'] + index(),
                            '--bottombar-height': BOTTOMBAR_HEIGHT + "px",
                            ...layer.style
                        }}
                        classList={{
                            'blocking-layer': layer.blockBehind,
                            ...layer.classList
                        }}
                    >
                        {layer.component()}
                    </div>
                )}
            </For>
        </div>
    )
}