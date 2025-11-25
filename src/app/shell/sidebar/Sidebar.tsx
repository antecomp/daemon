import sidebar_button_placeholder from "./assets/sidebar_button.png";
import sidebar_button_active from "./assets/sidebar_button_active.png"
import { createSignal, For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Swindow } from "./SWindow";
import DevMenu from "@/devtools/DevMenu";
import './sidebar.css'
import { sidebarLock } from "../locks/UILockManager";
import InventoryViewer from "@/features/inventory/InventoryViewer";

function getOffset(index: number, totalBoxes: number, HEIGHT: number, staticOffset: number) {
    const even = totalBoxes % 2 === 0;
  
    if (even) {
      const centerAbove = (totalBoxes / 2) - 1;
      const distance = index - centerAbove;
  
      if (distance === 0) return -HEIGHT / 2 + staticOffset;
      if (distance === 1) return HEIGHT / 2 + staticOffset;
  
      return Math.sign(distance) * ((Math.abs(distance) - 1) * HEIGHT + HEIGHT / 2) + staticOffset;
    } else {
      const center = Math.floor(totalBoxes / 2);
      return staticOffset + (index - center) * HEIGHT;
    }
}
  

export default function Sidebar() {

    const [openWindow, setOpenWindow] = createSignal<string | null>(null);
    const buttonRefs = new Map<string, HTMLElement>();


    // Todo: Make an interface and better typed logic for all of this.
    const menuItems = [
        {
            id: "example",
            title: 'EXAMPLE',
            content: () => <div style={{height: '200px', width: '300px'}}>
                <p style={{margin: "auto 0"}}>
                    This is a sidebar menu item. Eventually, this will be used to display things like player inventory and more.
                </p>
                </div>,
        },
        {
            id: "dev",
            title: 'DEVELOPER MENU',
            content: DevMenu
        },
        {
            id: 'inventory',
            title: 'FILE EXPLORER',
            content: InventoryViewer
        }
    ];

    const toggleMenu = (id: string | null) => {
        setOpenWindow(prev => (prev === id ? null : id));
    };

    // TODO: Configure this so that the buttons can have unique icons.
    return (
        <div id="sidebar">
            <For each={menuItems}>
                {item => (
                    <img 
                        src={openWindow() == item.id ? sidebar_button_active : sidebar_button_placeholder}
                        ref={el => buttonRefs.set(item.id, el)}
                        class="sidebar-button" 
                        id={item.id}
                        onClick={() => !sidebarLock.isLocked() && toggleMenu(item.id)}
                    />
                )}
            </For>

            <Show when={openWindow()}>
                <Dynamic 
                    component={Swindow} 
                    children={menuItems.find(i => i.id == openWindow()!)?.content()} 
                    offset={
                        getOffset( // ???
                            menuItems.findIndex(item => item.id == openWindow()),
                            menuItems.length,
                            82,
                            -17
                        )
                    }
                    title={menuItems.find(i => i.id == openWindow()!)?.title}
                    closeWindow={() => toggleMenu(openWindow())}
                />
            </Show>
        </div>
    )
}