export type MenuOption = {
    label: string,
    onSelect?: () => void;
}

export type SceneContextMenu = {
    prompt: string,
    width?: number,
    options: MenuOption[]
    position: {x: number, y: number}
} | null;