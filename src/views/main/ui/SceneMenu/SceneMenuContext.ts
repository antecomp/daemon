import { createContext, useContext } from "solid-js";
import { MenuOption } from "./scenemenu.types"
import { Vector2 } from "three";

type MenuContextType = {
    spawnMenu: (prompt: string, options: MenuOption[], mouse: Vector2, width?: number) => void;
    closeMenu: () => void;
}

export const MenuContext = createContext<MenuContextType>();
export const useSceneMenu = () => useContext(MenuContext);