import { createContext, useContext } from "solid-js";
import { MenuOption } from "./scenemenu.types"
import { Vector2 } from "three";

type SceneMenuContextType = {
    /** 
     * Creates a popup dropdown menu over the scene
     * @argument prompt - The prompt text, f.e "Open The Door?"
     * @argument option - A list of menu options, which consist of;
     *  - `label` - String that represents the option in the listr
     *  - `onSelect` - The callback that runs when the option is selected
     **/
    spawnMenu: (prompt: string, options: MenuOption[], mouse: Vector2, width?: number) => void;
    closeMenu: () => void;
}

export const SceneMenuContext = createContext<SceneMenuContextType>();
export const useSceneMenu = () => useContext(SceneMenuContext)!;