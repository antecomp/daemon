import { Scene } from "lume";
import bar_model from './assets/mad.glb?url'
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
            <lume-ambient-light id="ambientLight" intensity={2}/>
            <lume-gltf-model
                src={bar_model}
                id="bar"
                scale="100 100 100"
                align-point="0.5 0.5"
            />

            <Freecam sceneRef={sceneRef}/>
        </lume-scene>
    )
}