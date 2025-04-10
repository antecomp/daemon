import sidebar_button_placeholder from "../assets/sidebar_button.png";
import sidebar_button_active from "../assets/sidebar_button_active.png"
import { createSignal, For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Swindow } from "./SWindow";
import IModePicker from "./IMode";

function getOffset(index: number, totalBoxes: number, HEIGHT: number, staticOffset: number) {
    const even = totalBoxes % 2 === 0;
  
    if (even) {
      const centerAbove = (totalBoxes / 2) - 1;
      const distance = index - centerAbove;
  
      if (distance === 0) return -HEIGHT / 2;
      if (distance === 1) return HEIGHT / 2;
  
      return staticOffset + Math.sign(distance) * ((Math.abs(distance) - 1) * HEIGHT + HEIGHT / 2);
    } else {
      const center = Math.floor(totalBoxes / 2);
      return staticOffset + (index - center) * HEIGHT;
    }
  }
  


export default function Sidebar() {

    const [openWindow, setOpenWindow] = createSignal<string | null>(null);
    const buttonRefs = new Map<string, HTMLElement>();

    const menuItems = [
        {
            id: "inventory",
            content: () => <div><p style={{margin: "auto 0"}}>hhhh</p></div>,
        },
        {
            id: "settings",
            content: IModePicker,
        },
        {
            id: "slop",
            content: () => <div>aaaa</div>
        }
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
            </For>

            <Show when={openWindow()}>
                <Dynamic 
                    component={Swindow} 
                    anchorRef={buttonRefs.get(openWindow()!)!}
                    children={menuItems.find(i => i.id == openWindow()!)?.content()} 
                    offset={
                        getOffset(
                            menuItems.findIndex(item => item.id == openWindow()),
                            menuItems.length,
                            82,
                            -17
                        )
                    }
                />
            </Show>
        </div>
    )
}