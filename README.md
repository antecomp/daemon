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