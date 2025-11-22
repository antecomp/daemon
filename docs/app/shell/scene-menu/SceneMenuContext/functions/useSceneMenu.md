[**daemon**](../../../../../README.md)

***

# Function: useSceneMenu()

> **useSceneMenu**(): `SceneMenuContextType`

Defined in: [src/app/shell/scene-menu/SceneMenuContext.ts:28](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/app/shell/scene-menu/SceneMenuContext.ts#L28)

Hook to provide access to the SceneMenuContext, which provides the methods to spawn and close a menu.

## Returns

`SceneMenuContextType`

spawnMenu: A method for initiating a new scene menu;
- spawnMenu takes two arguments: [prompt: string - the menu prompt to show] & [options array, where each option is an object {label: <option string>, onSelect: <CB to run on select>}]

## Ref

SceneMenuContextType in SceneMenuContext.ts
