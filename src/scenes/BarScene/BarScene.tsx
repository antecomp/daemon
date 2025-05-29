import WadsCam from "@/components/lume/wadscam";
import applyDGShader from "@/core/lume/dgRender";
import { GltfModel, ObjModel, Scene } from "lume";
import {onMount} from "solid-js";
import barscene_model from "./models/barscene.dae?url"
import barscene_glb from "./models/barscene.glb?url"
import barobj from "./models/bar2.obj"
import barmtl from "./models/bar2.mtl"
import applyShadows from "@/core/lume/applyShadows";
import starfield from "../shared_textures/starfield.png"
import PlayerCam from "@/components/lume/playerCam/PlayerCam";

export default function BarScene() {
    let sceneRef!: Scene;
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
            {/* <WadsCam
                defaultPosition="-719 -327 151"
            /> */}

            <PlayerCam
                sceneRef={sceneRef}
                basePos={[-719, -327, 151]}
                baseOri={{yaw: 50, pitch: 0}}
                maxPitch={20}
                maxYaw={50}
            />

            <lume-ambient-light intensity={1}/>
            <lume-point-light position="-500 -180" intensity={1250} cast-shadow="true"/>
            {/* <lume-point-light position="0 -100 0" intensity={200} cast-shadow="true"/> */}
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

            <lume-sphere
                id="stars"
                texture={starfield}
                receive-shadow="false"
                //@ts-ignore
                has="basic-material"
                sidedness="back"
                size="5000 5000 5000"
                mount-point="0.5 0.5 0.5"
                color="white"
            />


        </lume-scene>
    )
}