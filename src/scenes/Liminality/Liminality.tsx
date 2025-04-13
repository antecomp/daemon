import baseobj from './models/base.obj'
import basemtl from './models/base.mtl'
import dmnobj from './models/diamond.obj'
import dmnmtl from './models/diamond.mtl'
import { ObjModel, Scene } from "lume";
import { createSignal, onMount } from "solid-js";
import applyShadows from '@/core/lume/applyShadows';
import Interactable from '@/components/lume/Interactable';
import applyDGShader from '@/core/lume/dgRender';
import NewCam from '@/components/lume/Newcam';
import { Gimbal } from '@/extra.types';

export default function Liminality() {
    let sceneRef: Scene | undefined;
    let baseRef: ObjModel | undefined;
    let dmnRef: ObjModel | undefined;

    const lightIntensity = "300";

    const [ovPos, setOVPos] = createSignal<[number, number, number]>();
    const [ovOri, setOVOri] = createSignal<Omit<Gimbal, "roll">>();
    const [animCam, setAnimCam] = createSignal(false);

    onMount(() => {
        requestAnimationFrame(() => {
            // sceneRef && applyShader(sceneRef, 0);
            sceneRef && applyDGShader(sceneRef);
            baseRef && applyShadows(baseRef);
            dmnRef && applyShadows(dmnRef);
        });
        (window as any).DG_updateSlop = (x: number, y: number, z: number, pitch: number, yaw: number, animate: boolean) => {
            setOVPos([x,y,z]);
            setOVOri({pitch, yaw});
            setAnimCam(animate);
        }

        (window as any).DG_stopSlop = () => {
            setOVPos(undefined);
            setOVOri(undefined);
            setAnimCam(true);
        }
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

            <NewCam 
                basePos={[0, -512, 350]} baseOri={{pitch: 0, yaw: 0}} 
                overridePos={ovPos()} overrideOri={ovOri()} animate={animCam()}

                maxYaw={20} maxPitch={20}
                sceneRef={sceneRef!}
            />

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
            //onHover={() => console.log("Diamond Hovered")}
            onClick={(uv, mouse) => {
                console.log("diamond click:", uv, mouse);
                setAnimCam(true);
                setOVPos([200, -712, 350]);
                setOVOri({pitch: 20, yaw: 30});
                setTimeout(() => {
                    setOVPos(undefined);
                    setOVOri(undefined);
                }, 2000);
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