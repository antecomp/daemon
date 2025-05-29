import WadsCam from "@/components/lume/wadscam";
import applyDGShader from "@/core/lume/dgRender";
import { GltfModel, ObjModel, Scene } from "lume";
import {onMount} from "solid-js";
import barscene_model from "./models/barscene.dae?url"
import barscene_glb from "./models/barscene.glb?url"
import barobj from "./models/bar2.obj"
import barmtl from "./models/bar2.mtl"
import applyShadows from "@/core/lume/applyShadows";

export default function BarScene() {
    let sceneRef: Scene | undefined;
    let aaa!: ObjModel;
    
    onMount(() => {
        sceneRef && requestAnimationFrame(() => applyDGShader(sceneRef));
        aaa && applyShadows(aaa);
    });

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf" 
            perspective="800"
            shadowmap-type="pcf"
            // fog-mode="linear"
            // fog-color="#000000"
            // fog-near="0" fog-far="1050"
        >
            <WadsCam
                defaultPosition="-719 -327 151"
            />

            <lume-ambient-light intensity={2}/>
            <lume-point-light position="-500 -150 20" intensity={1000} cast-shadow="true"/>
            {/* <lume-directional-light position="201 -447 229" intensity={5} cast-shadow="true" /> */}

            {/* <lume-collada-model
                id="scenebase"
                src={barscene_model}
                scale="50 50 50"
                recieve-shadow="true"
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
            /> */}

            {/* <lume-gltf-model
                id="scenebase"
                ref={slopRef}
                src={barscene_glb}
                scale="5 5 5"
                // recieve-shadow="true"
                // cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
            /> */}

            <lume-obj-model
                ref={aaa}
                obj={barobj}
                mtl={barmtl}
                scale="50 50 50"
                receive-shadow="true"
                cast-shadow="true"
            />


        </lume-scene>
    )
}