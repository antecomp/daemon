import { createContext, useContext } from "solid-js";
import { SceneContextMenu } from "./scenemenu.types"

type MenuContextType = {
    spawnMenu: (menu: SceneContextMenu) => void;
    closeMenu: () => void;
}

export const MenuContext = createContext<MenuContextType>();
export const useSceneMenu = () => useContext(MenuContext);