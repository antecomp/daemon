export type MenuOption = {
    label: string,
    //icon: AssetURL,
    onSelect: () => void;
}

export type ContextMenu = {
    prompt: string,
    options: MenuOption[]
    position?: {x: number, y: number}
} | null;