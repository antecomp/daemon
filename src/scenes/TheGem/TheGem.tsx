import { Scene } from "lume";
import bar_model from './assets/hate.glb?url'
import PlayerCam from "@/3d/camera/PlayerCam";
import Freecam from "@/3d/camera/Freecam";
import { useDGShader } from "@/3d/pipeline/dgRender";

export default function TheGem() {
    let sceneRef!: Scene;

    useDGShader(() => sceneRef);

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf"
            perspective="800"
            shadowmap-type="pcfsoft"
        >
            <lume-ambient-light id="ambientLight" intensity={6}/>
            {/* <lume-directional-light intensity={6} position="1 -1 1" id="pain" align-point="0.5 0.5"/> */}
            <lume-gltf-model
                src={bar_model}
                id="bar"
                scale="100 100 100"
                align-point="0.5 0.5"
            />

            <Freecam sceneRef={sceneRef} initialPos={[-1045, -186, 739]}/>
        </lume-scene>
    )
}