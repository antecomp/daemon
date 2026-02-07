import sidebar_button_placeholder from "./assets/sidebar_button.png";
import sidebar_button_active from "./assets/sidebar_button_active.png"
import { Component, createEffect, createSignal, For, JSX, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Swindow } from "./SWindow";
import DevMenu from "@/devtools/DevMenu";
import './sidebar.css'
import { sidebarLock } from "../locks/UILockManager";
import InventoryViewer from "@/features/inventory/InventoryViewer";
import { AssetURL } from "@/shared/types/misc.types";

import debug_icon from './assets/swindow-icons/debug.png';
import inventory_icon from './assets/swindow-icons/inventory.png';

interface SideBarItem {
    id: string,
    title: string,
    content: Component,
    contentStyle?: JSX.CSSProperties
    hideBottom?: boolean,
    icon?: AssetURL
}

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


    // Todo: Make an interface and better typed logic for all of this.
    const menuItems: SideBarItem[] = [
        {
            id: 'inventory',
            title: 'FILE EXPLORER',
            content: () => InventoryViewer({closeInventoryViewer() {setOpenWindow(null)}}),
            hideBottom: true,
            icon: inventory_icon,
            contentStyle: {
                'border-right': 'none',
            }
        },
        {
            id: "dev",
            title: 'DEVELOPER MENU',
            icon: debug_icon,
            content: DevMenu
        }
    ];

    const toggleMenu = (id: string | null) => {
        setOpenWindow(prev => (prev === id ? null : id));
    };

    // Close any open windows when the lock is active.
    createEffect(() => {
        if(sidebarLock.isLocked()) {
            setOpenWindow(null);
        }
    })

    const openWindowInfo = () => menuItems.find(i => i.id == openWindow());

    return (
        <div id="sidebar">
            <For each={menuItems}>
                {item => (
                    <div class="sidebar-button" classList={{'sidebar-button-active': openWindow() === item.id}}>
                    <img 
                        src={openWindow() == item.id ? sidebar_button_active : sidebar_button_placeholder}
                        id={item.id}
                        //  class="sidebar-button"
                        onClick={() => !sidebarLock.isLocked() && toggleMenu(item.id)}
                    />
                    <img src={item.icon} class="sidebar-item-icon"/>
                    </div>
                )}
            </For>

            <Show when={openWindow()}>
                <Dynamic 
                    component={Swindow} 
                    children={openWindowInfo()?.content({})} 
                    offset={
                        getOffset( // ???
                            menuItems.findIndex(item => item.id == openWindow()),
                            menuItems.length,
                            82,
                            -17
                        )
                    }
                    hideBottom={openWindowInfo()?.hideBottom}
                    title={openWindowInfo()?.title}
                    closeWindow={() => toggleMenu(openWindow())}
                    contentStyle={openWindowInfo()?.contentStyle}
                />
            </Show>
        </div>
    )
}