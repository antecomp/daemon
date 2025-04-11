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

## Project Structure
```
├── assets                  Static Assets.
│   ├── animations          
│   │   └── overlays        Short animations that play in-battle (f.e slash), use webms
│   │
│   ├── artwork
│   │   ├── battle_bgs      Image backgrounds, used as texture input for background shaders.
│   │   ├── characters
│   │   ├── dæmons          Opponent artwork in battle
│   │   └── dialogue_bgs
│   │
│   ├── fonts
│   │
│   ├── icons               Common, reusable icons. Currently just used for battle stuff.
│   │   ├── battle-alerts
│   │   └── statuses
│   │
│   ├── placeholders        Placeholder assets of any variety, in this bin out of laziness.
│   │
│   ├── sfx                 Soundbites.
│   │   └── battle
│   │
│   └── ui                  Common, reusable UI assets (such as the cut corner decorations)
│       └── corners
│
├── components              Common, reusable components.
│   ├── development         Testing and visualizing components, not for prod.
│   ├── lume
│   │   └── multicam
│   │       └── behaviors
│   └── util
│       └── corner-rect
│
├── core                    Overarching game logic systems, should be self-contained & then linked to the UI with a hook.
│   │                       Will often have Manager/Service singletons for instantiating/tracking usage in UI, separate from logic.
│   ├── battle
│   │   ├── ai
│   │   ├── animation
│   │   ├── engine
│   │   ├── moves
│   │   │   ├── icons
│   │   │   └── metas
│   │   └── statuses
│   │
│   ├── dialogue
│   │
│   ├── interaction
│   │
│   └── lume
│
├── data                    Static scripts to interface with core logic, such as battles, dialogues...
│   └── battles
│
├── hooks                   Reusable UI hooks, f.e createTypewriter.
│
├── layers                  Large self-contained UI components. Also contains the layer manager system.
│   ├── battle
│   └── hermes
│
├── scenes                  3D (lume JSX) scenes.
│   ├── SceneName           Organized into a folder by the same name, this would contain SceneName.tsx
│   │   ├── dialogues       Scene-owned data such as dialogues or battles can be contained here.
│   │   └── models          Scene-owned 3D models and assets are kept here.
│   │
│   ├── shared_models       (might move this to /assets/ proper)
│   └── shared_textures     (might move this to /assets/ proper)
│
├── shaders                 Shaders, saved as glsl files (imported with ?raw)
│   ├── backgrounds         Battle background fragment shaders, painted on a fullscreen quad.
│   └── post-processing     3D scene post processing shaders.
│
├── styles
├── tests
├── utils                   Short reusable utilily functions (lerp, pickRandom, sleep...)
│
└── views                   Entry points (currently just main)
    └── main
```