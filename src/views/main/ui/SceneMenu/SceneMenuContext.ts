import { createContext, useContext } from "solid-js";
import { ContextMenu } from "./scenemenu.types"

type MenuContextType = {
    spawnMenu: (menu: ContextMenu) => void;
    closeMenu: () => void;
}

export const MenuContext = createContext<MenuContextType>();
export const useSceneMenu = () => useContext(MenuContext);