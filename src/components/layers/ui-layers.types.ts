import { Accessor, JSX } from "solid-js";

export type MetaLayer = 'bottom' | 'middle' | 'top';

export enum MainUILock {
    Sidebar,
    Scene,
    All
}

export type UILayer = {
    id: string
    component: JSX.Element
    metaLayer?: MetaLayer
    lock?: MainUILock
    blockBehind?: boolean
}

export type UILockState = {
    sceneLocked: Accessor<boolean>
    sidebarLocked: Accessor<boolean>
    uiLocked: Accessor<boolean>
}