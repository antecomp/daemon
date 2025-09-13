import { ObjModel, onMount, Scene } from "lume";
import barX from "./models/hype.fbx?url"
//import barObj from "./models/bbb.obj"
//import barMtl from "./models/bbb.mtl"
import PlayerCam from "@/components/lume/playerCam/PlayerCam";
import Freecam from "@/components/lume/playerCam/Freecam";
import applyShadows from "@/core/lume/applyShadows";
import { useDGShader } from "@/core/lume/dgRender";

import starfield from "../shared_textures/starfield.png"
import createCameraController from "@/components/lume/playerCam/createCameraController";
import NavigationPlane from "@/components/lume/NavigationPlane";

export default function GemmaBar() {
    let sceneRef!: Scene;
    let barRef!: any
    onMount(() => barRef && applyShadows(barRef));
    useDGShader(() => sceneRef);

    //const {cameraControlSignals, cameraController} = createCameraController([87, -43, 690], {yaw: -45, pitch: 0}, {maxPitch: 20, maxYaw: 70});
    const {cameraControlSignals, cameraController} = createCameraController([6, -52, 84], {yaw: -179, pitch: -2}, {maxPitch: 20, maxYaw: 70});
    
    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf"
            perspective="800"
            shadowmap-type="pcfsoft"
        >
            <lume-ambient-light intensity={1.5}/>
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
            <lume-fbx-model
                id="bar"
                ref={barRef}
                src={barX}
                scale="0.1 0.1 0.1"
                mount-point="0.5 0.5"
                align-point="0.5 0.5"
            />
            {/* <lume-obj-model
                id="bar"
                ref={barRef}
                obj={barObj}
                mtl={barMtl}
                scale="8 8 8"
                mount-point="0.5 0.5"
                align-point="0.5 0.5"
            /> */}


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



            <Freecam sceneRef={sceneRef} initialPos={[0, -100, 0]}/>
            {/* <NavigationPlane
                cameraController={cameraController}
                newPos={[87, -43, 690]}
                newOri={{yaw: -45, pitch: 0}}
                planePosition={[87, -43, 690]}
                planeSize={150}
                anim
            />

            <NavigationPlane
                cameraController={cameraController}
                newPos={[6, -52, 84]}
                newOri={{yaw: -179, pitch: -2}}
                planePosition={[6, -52, 84]}
                planeSize={150}
                anim
            />


             <PlayerCam
                {...cameraControlSignals()}
                sceneRef={sceneRef!}
            /> */}
        </lume-scene>
    )
}