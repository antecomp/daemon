import spz from "./glTF/Sponza.gltf?url";
import { Scene } from "lume";
import {onMount} from "solid-js";
import NewCam from "@/components/lume/Newcam";
import applyDGShader from "@/core/lume/dgRender";

export default function Sponza() {
    let sceneRef: Scene | undefined;
    
    onMount(() => {
        if (sceneRef) {
            requestAnimationFrame(() => {
                applyDGShader(sceneRef);
            });
        }
    })

    return(
        <lume-scene 
            webgl
            ref={sceneRef} 
            shadow-mode="basic" 
            id='SCENE'
            physically-correct-lights 
            perspective="800"
        >

        <NewCam basePos={[-5, -52, 4]} baseOri={{pitch: 0, yaw: 73}} sceneRef={sceneRef!} maxPitch={25} maxYaw={25}/>

            <lume-ambient-light intensity={8} />

            <lume-directional-light
                intensity="12" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -256 100" 
                color="white"
                cast-shadow="true"
            />

            <lume-gltf-model
                align-point="0.5 0.5"
                scale="50 50 50"
                src={spz}
            ></lume-gltf-model>

        </lume-scene>
    )
}