import PlayerCam from "@/3d/camera/PlayerCam";
import { useDGShader } from "@/3d/pipeline/dgRender";
import createTileNavigator from "@/3d/tile/createTileNavigator";
import world from './assets/world.glb';
import { Scene } from "lume";
import NM from './assets/NM.json';
import { NavMap } from "@/3d/tile/tilenav.types";

export default function TestA() {
    const { cameraControlSignals, cameraController, navController, navListen } = createTileNavigator(NM as NavMap);
    let sceneRef!: Scene;
    useDGShader(() => sceneRef);

    return <lume-scene
        ref={sceneRef}
        webgl
        shadow-mode="basic"
        id='SCENE'
        physically-correct-lights
        perspective="800"
    >
        <PlayerCam
            sceneRef={sceneRef}
            {...cameraControlSignals()}
            interactionDistance={120}
        />

        <lume-ambient-light intensity={4.5}/>

        <lume-gltf-model
            align-point="0.5 0.5"
            scale="10 10 10"
            src={world}
        />
    </lume-scene>
}