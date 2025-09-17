Code for the [daemon.garden](https://daemon.garden) web-game by omnidisplay ([omni.vi](https://omni.vi)).

## Commands 

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.<br>
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `npm run build`

Builds the app for production to the `dist` folder.<br>

Regarding .mtl paths;
After building for prod, crummy workaround right now is to just go to the mtl files and change the paths to look like
`map_Kd ../textures/whatever/path/needed.png`

I will see if I can automate this later, either in vite or just as a post-build script `¯\_(ツ)_/¯`

### `npm run test`

Runs all tests. This automatically re-runs whenever the code updates so it's best to have this running in the background when adding new features to catch anything game-breaking.

# Project Structure
```
src
├── 3d                          Components and logic for the 3D enviornments.
│   ├── camera                  
│   ├── components              3D env primitives/wrappers (f.e "Interactable")
│   ├── pipeline                Rending pipeline utils (hooks to attach render passes, shadows, etc.)
│   └── shaders
│       └── post-processing
├── app                         Main app *ui* components, container for Main.tsx (root component and shell of the whole game UI)
│   ├── assets
│   └── shell                   Components composing Main, organized by system/purpose
│       ├── fallbacks
│       ├── hud
│       │   └── assets          (single use assets should localized to component families)
│       ├── layers
│       ├── scene-container
│       ├── scene-fade-overlay
│       ├── scene-menu
│       └── sidebar
├── assets                      shared assets (as in, used by multiple components, scenes, whatever)
│   ├── 3d                      
│   │   ├── models 
│   │   └── textures 
│   ├── artwork                 artwork/assets that are used in multiple places (as per spec above). 
│   │   ├── battle_bgs
│   │   ├── characters
│   │   ├── dæmons
│   │   └── dialogue_bgs
│   ├── fonts
│   ├── icons
│   │   ├── battle-alerts
│   │   └── statuses
│   ├── placeholders
│   ├── sfx
│   │   └── battle
│   └── ui                      reused UI assets.
│       ├── corners
│       └── cursors
├── config                      config files, broken up by theme (init, UI, timings, etc.). Unify consts here to have an easy point for tweaking.
├── core                        core game *logic* (hooks, managers, singletons, etc). Non-UI related code.
│   ├── audio
│   ├── battle                  complex logic (such as battle) can be organized however you need internally
│   │   ├── ai
│   │   ├── animation
│   │   ├── engine
│   │   ├── moves
│   │   │   ├── icons
│   │   │   └── metas
│   │   └── statuses
│   ├── dialogue
│   └── interaction
├── data                        game data: configure enemies, NPCs, scene-agnostic dialogues and whatever else here.
│   └── battles
├── devtools                    components, scripts & helpers for development. Should be disabled for prod.
├── features                    core game *UI* components (not general shell stuff, but full game "features" (additional views, mechanics)).
│   ├── battle                  
│   │   ├── assets              assets needed for the UI should be localized by feature.
│   │   ├── backgrounds         putting backgrounds here for accessibility, consider placing this in assets also.
│   │   ├── ui                  components composing the main Battle UI.
│   │   └── Battle.tsx          entry point for feature should be direct child of the folder.
│   ├── hermes
│   │   └── assets
│   └── text-overlay
├── platform                    vite entry stuff (vite.env.d, index.ts)
├── scenes                      Game scene components (components return 3D lume scene and encapsulate local for active scene)
│   ├── SceneName
│   │   ├── dialogues           data local to (only used by) the scene (compared to the global data folder) can be contained named inside the scene folder.
│   │   ├── assets              any generic assets local to the scene, music, textures, whatever...
│   │   ├── models 
│   │   └── SceneName.tsx       SceneName.tsx should be at the top, and match the name of, it's containing folder.
│   └── loadScene.ts            helper to load scenes (dynamic import) is placed here to make path resolution more reliable.
├── shared                      any logic that multiple components may use
│   ├── hooks                   hooks for misc features (i.e createTypewriter)
│   ├── styles                  general CSS, currently just base.css
│   ├── types                   shared, generic types, sorted by purpose (f.e 3d.types.ts)
│   ├── ui
│   │   └── primitives          UI primitives, f.e CornerRect
│   └── utils                   general utility functions, individual files. F.e lerp.ts
└── tests                       tests, grouped by feature/category
    └── dialogues
```

Distinction: `data` is configurations/information used to instantiate game items, this is stuff like the instantiations of Opponent for battles & dialogue graphs.
Whereas `assets` are static non-code things, such as images, audio, etc.
