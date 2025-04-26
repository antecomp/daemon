export type MenuOption = {
    label: string,
    //icon: AssetURL,
    onSelect?: () => void;
}

export type SceneContextMenu = {
    prompt: string,
    width?: number,
    options: MenuOption[]
    position: {x: number, y: number}
} | null;