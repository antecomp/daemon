import { ObjModel, onMount, Scene } from "lume";
import barX from "./models/kms.fbx?url"
//import barObj from "./models/bbb.obj"
//import barMtl from "./models/bbb.mtl"
import PlayerCam from "@/components/lume/playerCam/PlayerCam";
import Freecam from "@/components/lume/playerCam/Freecam";
import applyShadows from "@/core/lume/applyShadows";
import { useDGShader } from "@/core/lume/dgRender";

import starfield from "../shared_textures/starfield.png"
import createCameraController from "@/components/lume/playerCam/createCameraController";
import NavigationPlane from "@/components/lume/NavigationPlane";


import suited_man from "./assets/suited_figure.png";
import d_overlay from "./assets/d_overlay.png";

import Billboard from "@/components/lume/Billboard";
import { DialogueService } from "@/core/dialogue/dialogueService";
import dialogue_root from "@/tests/dialogues/intro_dia";
import { startDialogueWithCamOvr } from "@/components/lume/playerCam/dialogueCamera";

export default function GemmaBar() {
    let sceneRef!: Scene;
    let barRef!: any
    onMount(() => barRef && applyShadows(barRef));
    useDGShader(() => sceneRef);

    const {cameraControlSignals, cameraController} = createCameraController([-439, -55, 523], { yaw: 32, pitch: 3 }, {maxPitch: 20, maxYaw: 45})
    
    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf"
            perspective="800"
            shadowmap-type="pcfsoft"
        >
            <lume-ambient-light id="ambientLight" intensity={1.8}/>
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
                shadow-bias="-0.0001"
                // shadow-normal-bias="0.5"// no noticable change.
            />

            <lume-fbx-model
                id="bar"
                ref={barRef}
                src={barX}
                scale="0.1 0.1 0.1"
                mount-point="0.5 0.5"
                align-point="0.5 0.5"
            />

            <lume-sphere
                id="stars"
                texture={starfield}
                cast-shadow="false"
                receive-shadow="false"
                //@ts-ignore
                has="basic-material"
                sidedness="back"
                size="4000 4000 4000"
                align-point="0.5 0.5"
                mount-point="0.5 0.5 0.5"
                color="white"
            />

            {/* <lume-camera-rig></lume-camera-rig> */}

            <Billboard
                texture={suited_man}
                position="-505 -40 390"
                scale={80}

                interactions={[
                    undefined,
                    () => startDialogueWithCamOvr(
                        cameraController, 
                        [-470, -64, 483], 
                        { yaw: 8, pitch: 8 }, 
                        dialogue_root, 
                        true,
                        {overlay: d_overlay}
                    )
                ]}
            />

            <PlayerCam
                {...cameraControlSignals()}
                sceneRef={sceneRef}
            />


            {/* <Freecam sceneRef={sceneRef} initialPos={[20, -100, 0]}/> */}

            {/* <PlayerCam
                basePos={[76, -73, 603]}
                baseOri={{ yaw: -677, pitch: -1 }}
                maxYaw={25}
                maxPitch={20}
                animate={false}
                sceneRef={sceneRef!}
            /> */}
        </lume-scene>
    )
}