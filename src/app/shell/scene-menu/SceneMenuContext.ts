import { createContext, useContext } from "solid-js";
import { MenuOption } from "./scenemenu.types"
import { Vector2 } from "three";

type SceneMenuContextType = {
    /** 
     * Creates a popup dropdown menu over the scene
     * @argument prompt - The prompt text, f.e "Open The Door?"
     * @argument options - A list of menu options, which consist of;
     *  - `label` - String that represents the option in the listr
     *  - `onSelect` - The callback that runs when the option is selected
     **/
    spawnMenu: (prompt: string, options: MenuOption[], mouse: Vector2, width?: number) => void;
    /** closeMenu: method that closes the active scene menu (wow) */
    closeMenu: () => void;
}

export const SceneMenuContext = createContext<SceneMenuContextType>();

/** Hook to provide access to the SceneMenuContext, which provides the methods to spawn and close a menu. */
export const useSceneMenu = () => useContext(SceneMenuContext)!;