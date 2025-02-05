import WadsCam from "@/components/util/wadscam";
import applyShader from "@/util/applyShader";
import spz from "./glTF/Sponza.gltf?url";
import { Scene } from "lume";
import {onMount} from "solid-js";

export default function Sponza() {
    let sceneRef: Scene | undefined;
    
    onMount(() => {
        if (sceneRef) {
            requestAnimationFrame(() => {
                applyShader(sceneRef);
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
            <WadsCam/>

            <lume-ambient-light intensity={8} />

            <lume-gltf-model
                align-point="0.5 0.5"
                scale="50 50 50"
                src={spz}
            ></lume-gltf-model>

        </lume-scene>
    )
}