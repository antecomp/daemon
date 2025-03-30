import baseobj from './models/base.obj?url'
import basemtl from './models/base.mtl?url'
import dmnobj from './models/diamond.obj?url'
import dmnmtl from './models/diamond.mtl?url'
import applyShader from "@/core/lume/applyShader";
import { ObjModel, Scene } from "lume";
import { onMount } from "solid-js";
import applyShadows from '@/core/lume/applyShadows';
import Interactable from '@/components/lume/Interactable';
import SlopCam, { cameraController } from '@/components/lume/slopcam/Slopcam';
import { lerpToAsync, playerCam } from '@/components/lume/slopcam/slopcam.behaviors';
import sleep from '@/util/sleep';

export default function Liminality() {
    let sceneRef: Scene | undefined;
    let baseRef: ObjModel | undefined;
    let dmnRef: ObjModel | undefined;

    const lightIntensity = "300";

    onMount(() => {
        requestAnimationFrame(() => {
            sceneRef && applyShader(sceneRef, 0);
            baseRef && applyShadows(baseRef);
            dmnRef && applyShadows(dmnRef);
        });
    })

    function handleDiamondClick() {
        const [behavior, finished] = lerpToAsync([0, -512, 141], 0, -22);
        cameraController.setTemporaryBehavior(behavior);
        finished.then(() => {
            const [behavior, nextPromise] = lerpToAsync([0, -512, 141], 0, -22);
            cameraController.setTemporaryBehavior(behavior);
            return nextPromise;
        }
        )
        .then(() => {
            const [behavior, nextPromise] = lerpToAsync([0, -512, 241], 0, -22);
            cameraController.setTemporaryBehavior(behavior);
            return nextPromise
        })
        .then(() => {
            cameraController.setTemporaryBehavior(playerCam("0 -512 241", 20, 20, 0, -22));
            sleep(1000).then(() => {
                cameraController.clearTemporaryBehavior();
            });
        })
    }

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
            <SlopCam initialBehavior={playerCam("0 -512 350", 20, 20, 0, -15)} />

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
            onClick={() => handleDiamondClick()}
            onHover={() => console.log("SLOP")}
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
                intensity={lightIntensity}
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -550 100" 
                color="white"
                cast-shadow="true"
            />

            <lume-point-light 
                intensity={lightIntensity}
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="-100 -550 -100" 
                color="white"
                cast-shadow="true"
            />

            <lume-point-light 
                intensity={lightIntensity}
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -550 -100" 
                color="white"
                cast-shadow="true"
            />

            <lume-point-light 
                intensity={lightIntensity}
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="-100 -550 100" 
                color="white"
                cast-shadow="true"
            /> 

            <lume-point-light 
                intensity={lightIntensity}
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="0 -700 0" 
                color="white"
                cast-shadow="true"
            />
        </lume-scene>
    )
    
}