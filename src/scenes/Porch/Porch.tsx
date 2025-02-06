import HeadCam from "@/components/util/HeadCam";
import WadsCam from "@/components/util/wadscam";
import mapobj from './models/map.obj?url';
import mapmtl from './models/map.mtl?url';
import { onMount, Scene } from "lume";
import applyShader from "@/util/applyShader";
import starfield from "../shared_textures/starfield.png"
import BillboardSprite from "@/components/util/BillboardSprite";
import viyaTexture from "@/assets/artwork/characters/viya.png"
import Interactable from "@/components/util/Interactable";

export default function Porch() {
    let sceneRef: Scene | undefined;

    onMount(() => {
        if(sceneRef) {
            requestAnimationFrame(() => {
                applyShader(sceneRef);
            });
        }
    })

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf" 
            perspective="800"
            shadowmap-type="pcf"
        >

            {/* <WadsCam
                defaultPosition="-228 -282 -5"
            /> */}
            <HeadCam
                position="-230 -317 128"
                baseOrientation={{yaw: 290, pitch: 0}}
                maxPitch={25}
                maxYaw={45}
            />

            <lume-ambient-light intensity={4} />

            <lume-point-light 
                intensity="6000" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -356 200" 
                color="white"
                cast-shadow="true"
                shadow-mapSize={{ x: 1024, y: 1024 }} // Higher values = sharper shadows
                // shadow-bias={-0.005} // Reduce shadow acne
            >
                {/* <lume-sphere size="20" 
                    cast-shadow="true" 
                    receive-shadow="false" 
                    color="#ff006e" 
                    //@ts-ignore
                    has="basic-material"
                ></lume-sphere> */}
            </lume-point-light>

            <lume-point-light 
                intensity="6000" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -356 0" 
                color="white"
                cast-shadow="true"
                shadow-mapSize={{ x: 1024, y: 1024 }} // Higher values = sharper shadows
                // shadow-bias={-0.005} // Reduce shadow acne
            >
                {/* <lume-sphere size="20" 
                    cast-shadow="true" 
                    receive-shadow="false" 
                    color="#ff006e" 
                    //@ts-ignore
                    has="basic-material"
                ></lume-sphere> */}
            </lume-point-light>

            {/* <lume-directional-light
                intensity="120" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -128 100" 
                color="white"
                cast-shadow="true"
            /> */}

            <lume-sphere
                id="stars"
                texture={starfield}
                receive-shadow="false"
                //@ts-ignore
                has="basic-material"
                sidedness="back"
                size="6000 6000 6000"
                mount-point="0.5 0.5 0.5"
                color="white"
            ></lume-sphere>

            <Interactable onClick={() => alert("slop")}>
                <BillboardSprite
                    texture={viyaTexture}
                    size={225}
                    position="-90 -230 0"
                />
            </Interactable>

            <lume-obj-model
                id="map"
                obj={mapobj}
                mtl={mapmtl}
                recieve-shadow="true"
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
            ></lume-obj-model>

        </lume-scene>
    )
}