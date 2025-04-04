import baseobj from './models/base.obj'
import basemtl from './models/base.mtl'
import dmnobj from './models/diamond.obj'
import dmnmtl from './models/diamond.mtl'
import applyShader from "@/core/lume/applyShader";
import { ObjModel, Scene } from "lume";
import { onMount } from "solid-js";
import applyShadows from '@/core/lume/applyShadows';
import Interactable from '@/components/lume/Interactable';
import Multicam, { currentCameraController } from '@/components/lume/multicam/Multicam';
import { lerpTo, playerCam } from '@/components/lume/multicam/multicam-behaviors';

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
        //currentCameraController().setTemporaryBehavior(lerpTo("389 -747 370", 45, 28));

        // cache position/orientation before animation so we can return to it.
        const returnTo = currentCameraController().currentTransform;
        // little CB-hell, likely will use async version in most cases
        // lerpTo other location -> lerp back to where we were -> hand control back off to base behavior (player camera)
        currentCameraController().setTemporaryBehavior(lerpTo("389 -747 370", 45, 28, undefined, () => {
            currentCameraController().setTemporaryBehavior(lerpTo(returnTo.position, returnTo.yaw, returnTo.pitch, undefined, () => {
                currentCameraController().stopTemporaryBehavior();
            }))
        }));
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
            <Multicam initialBehavior={playerCam("0 -512 350", 20, 20, 0, -15)} />

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
            //onHover={() => console.log("Diamond Hovered")}
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