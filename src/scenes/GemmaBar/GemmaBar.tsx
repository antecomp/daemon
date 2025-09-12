import { ObjModel, onMount, Scene } from "lume";
import barX from "./models/blendver.glb?url"
import barObj from "./models/bbb.obj"
import barMtl from "./models/bbb.mtl"
import PlayerCam from "@/components/lume/playerCam/PlayerCam";
import Freecam from "@/components/lume/playerCam/Freecam";
import applyShadows from "@/core/lume/applyShadows";

export default function GemmaBar() {
    let sceneRef!: Scene;
    let barRef!: ObjModel
    onMount(() => barRef && applyShadows(barRef));
    
    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf"
            perspective="800"
            shadowmap-type="pcf"
            camera-far="999999999999999999"
        >
            <lume-ambient-light intensity={1}/>
            <lume-directional-light 
                id="whar"
                position="-794, -80, 448" 
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                intensity={2}
                // color="red"
                cast-shadow="true" 
                shadow-map-height={4096} 
                shadow-map-width={4096}
                shadow-bias="-0.00001"
                // shadow-normal-bias="0.5"// no noticable change.
            />
            {/* <lume-point-light 
                id="what"
                intensity={2000} 
                position="-385, -121, 169" 
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                cast-shadow="true"
            >
                <lume-sphere
                    align-point="0.5 0.5"
                    mount-point="0.5 0.5"
                    size="10 10 10"
                    //@ts-expect-error
                    has="basic-material"
                    cast-shadow="false"
                    color="red"
                />
            </lume-point-light> */}
            {/* <lume-gltf-model
                id="bar"
                src={barX}
                scale="50 50 50"
                mount-point="0.5 0.5"
                align-point="0.5 0.5"
            /> */}
            <lume-obj-model
                id="bar"
                ref={barRef}
                obj={barObj}
                mtl={barMtl}
                scale="8 8 8"
                mount-point="0.5 0.5"
                align-point="0.5 0.5"
            />

            {/* <lume-camera-rig></lume-camera-rig> */}
            <Freecam sceneRef={sceneRef} initialPos={[0, -100, 0]}/>
        </lume-scene>
    )
}