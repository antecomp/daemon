Code for the [https://daemon.garden](daemon.garden) web-game by omnidisplay ([https://omni.vi](omni.vi)).

## Commands 

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.<br>
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### `npm run build`

Builds the app for production to the `dist` folder.<br>

Currently we have a stupid thing to disable inlining due to misconfigurations with mtl files. Hopefully that can be fixed in the future.

### `npm run test`

Runs all tests. This automatically re-runs whenever the code updates so it's best to have this running in the background when adding new features to catch anything game-breaking.

## Project Structure
```
src
├── assets                      Static Game Assets
│   ├── animations              Spritesheets (name change likely)
│   │   └── overlays
│   ├── artwork                 Flat artwork (sprites and backgrounds)
│   │   ├── characters
│   │   ├── dæmons
│   │   └── dialogue_bgs
│   ├── fonts
│   ├── icons
│   ├── sfx
│   └── ui                      *Common* UI asset images (f.e border designs).
├── components
│   ├── development             Helper components for development (debug stuff)
│   ├── lume                    3D scene general utility components (f.e camera stuff)
│   ├── ui                      Specific UI components, (will likely move to views/main)
│   ├── util                    Reusable general components. (f.e CornerRect)
│   └── views                   Overarching Game View Container Components.
│       ├── battle                  View folders contain any view-specific components.
│       │   ├── assets              Assets that only components in this view need.
│       │   └── ui                  Sub-components used just by this view (f.e "BattleCanvas.tsx")
│       │                               Convention of ComponentName.tsx and component-name.css in here...
│       └── main
├── core                        Game logic code. Usually general code + some hook to utilize it.
│   ├── battle
│   │   ├── animation           Animation *code*, little async functions to trigger battle animations
│   │   ├── engine              Core systems for battle, contains actual useBattleLogic hook.
│   │   ├── moves               Move data and configuration, general.
│   │   │   ├── icons
│   │   │   └── metas           Specific configuration of move metadata wrappers (stuff like icons/animations)
│   │   └── statuses            Status logic and basic statuses.
│   │
│   ├── dialogue                Dialogue (i.e "Hermes") logic. Methods for creating dialogue + dialogue traversal hook.      
│   └── lume                    Lume/ThreeJS Helpers and hooks (i.e applyShader)
│
├── dialogues                   Global Dialogues (Just samples for now, may remove this)
│
├── hooks                       Utility hooks (more general than those provided by core)
│
├── scenes                      Components for handling individual 3D scenes in the game and their local logic.
│   └── SceneName
│       ├── dialogues           Dialogue code associated with just this scene
│       └── models              Models associated with just this scene (may change)
│
├── shaders
│   ├── backgrounds             Battle background fragment shaders.
│   └── post-processing         Shaders for 3D scenes (screenspace render-passes, such as dithering).
├── style                       *global* css stuff.
├── tests
├── (extra.types.ts)            *global* general types (f.e CoordinatePair)
│ 
└── util                        Basic reusable utility methods (f.e pickRandom, lerp, sleep).
```