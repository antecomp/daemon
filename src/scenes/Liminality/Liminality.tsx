import baseobj from './models/base.obj?url'
import basemtl from './models/base.mtl?url'
import dmnobj from './models/diamond.obj?url'
import dmnmtl from './models/diamond.mtl?url'
import WadsCam from "@/components/lume/wadscam";
import applyShader from "@/core/lume/applyShader";
import { ObjModel, Scene } from "lume";
import { onMount } from "solid-js";
import applyShadows from '@/core/lume/applyShadows';
import HeadCam from '@/components/lume/HeadCam';
import Interactable from '@/components/lume/Interactable';
import { DialogueService } from '@/core/dialogue/dialogueManager';
import hijackCamera from '@/components/lume/hijackCamera';

export default function Liminality() {
    let sceneRef: Scene | undefined;
    let baseRef: ObjModel | undefined;
    let dmnRef: ObjModel | undefined;

    let piss = "400";

    onMount(() => {
        requestAnimationFrame(() => {
            sceneRef && applyShader(sceneRef);
            baseRef && applyShadows(baseRef);
            dmnRef && applyShadows(dmnRef);
        })
    })

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf" 
            perspective="800"
            physically-correct-lights
            fog-mode="linear" fog-color="#000000" fog-near="500" fog-far="900"
            shadowmap-type="pcf"
        >
            <lume-ambient-light intensity={0.0} />

            {/* <WadsCam defaultPosition='0 -502 503'/> */}
            <HeadCam position="0 -512 350" baseOrientation={{yaw: 360, pitch: -15}} maxPitch={10} maxYaw={20}/>

            <lume-obj-model
                id="base"
                ref={baseRef}
                obj={baseobj}
                mtl={basemtl}
                recieve-shadow="true"
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                scale="50 50 50"
            />

        <Interactable
            onClick={() => {
                let hi = hijackCamera({sceneRef, targetOrientation: {yaw: 45, pitch: 28}, targetPosition: "389 -747 370"})
                setTimeout(() => {
                    hi?.remove();
                }, 10000)
            }}
        >
                <lume-obj-model
                    id="dmn"
                    ref={dmnRef}
                    obj={dmnobj}
                    mtl={dmnmtl}
                    recieve-shadow="true"
                    cast-shadow="true"
                    align-point="0.5 0.5"
                    mount-point="0.5 0.5"
                    scale="50 50 50"
                    //@ts-ignore
                    position={(x: number, y: number, z: number, t: number) => [x, 8 * Math.sin(t/1000), z]}
                    //@ts-ignore
                    rotation={(x: number, y: number) => [x, y+0.5]}
                />
        </Interactable>



            <lume-point-light 
                intensity={piss}
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -550 100" 
                color="white"
                cast-shadow="true"
            />

            <lume-point-light 
                intensity={piss}
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="-100 -550 -100" 
                color="white"
                cast-shadow="true"
            />

            <lume-point-light 
                intensity={piss}
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -550 -100" 
                color="white"
                cast-shadow="true"
            />

            <lume-point-light 
                intensity={piss}
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="-100 -550 100" 
                color="white"
                cast-shadow="true"
            /> 

            <lume-point-light 
                intensity={piss}
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="0 -700 0" 
                color="white"
                cast-shadow="true"
            />
        </lume-scene>
    )
    
}