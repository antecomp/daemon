import { startBattle } from "@/core/battle/battleManager";
import sidebar_button_placeholder from "../assets/sidebar_button.png";
import sidebar_button_active from "../assets/sidebar_button_active.png"
import { OPPONENT_PANOPTES } from "@/data/battles/panoptes";
import { createSignal, For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Swindow } from "./SWindow";
import Battle from "@/components/layers/battle/Battle";
import IModePicker from "./IMode";

export default function Sidebar() {

    const [openWindow, setOpenWindow] = createSignal<string | null>(null);
    const buttonRefs = new Map<string, HTMLElement>();

    const menuItems = [
        {
            id: "inventory",
            content: () => <div>hi</div>,
        },
        {
            id: "settings",
            content: IModePicker,
        },
    ];

    const toggleMenu = (id: string) => {
        setOpenWindow(prev => (prev === id ? null : id));
    };

    return (
        <div id="sidebar">
            <For each={menuItems}>
                {item => (
                    <img 
                        src={openWindow() == item.id ? sidebar_button_active : sidebar_button_placeholder}
                        ref={el => buttonRefs.set(item.id, el)}
                        class="sidebar-button" 
                        id={item.id}
                        onClick={() => toggleMenu(item.id)}
                    />
                )}
                {/* Might want to make a containing div for each button and
                    put the conditional render inside here (multiple shows instead of a dynamic
                    so we can natively get the div relative to the button) */}
            </For>

            <Show when={openWindow()}>
                <Dynamic 
                    component={Swindow} 
                    anchorRef={buttonRefs.get(openWindow()!)!}
                    children={menuItems.find(i => i.id == openWindow()!)?.content()} 
                />
            </Show>
        </div>
    )
}