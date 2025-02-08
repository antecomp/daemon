//import HeadCam from "@/components/lume/HeadCam";
import WadsCam from "@/components/lume/wadscam";
import mapobj from './models/map.obj?url';
import mapmtl from './models/map.mtl?url';
import thingy from './models/thingy.gltf?url'
import { onMount, Scene } from "lume";
import applyShader from "@/core/applyShader";
import player_ref from '../shared_models/player_ref.fbx?url'

export default function ThirdScene() {
    let sceneRef: Scene | undefined;

    onMount(() => {
        if (sceneRef) {
            requestAnimationFrame(() => {
                applyShader(sceneRef);
            });
        }
    })

    return (
        <lume-scene webgl ref={sceneRef} perspective={800}>
            <lume-ambient-light intensity={10} />
            <WadsCam/>
            {/* <HeadCam
                position="231 -232 -169"
                baseOrientation={{yaw: -230, pitch: 20}}
                maxPitch={45}
                maxYaw={45}
            /> */}

            <lume-obj-model
                id="map"
                obj={mapobj}
                mtl={mapmtl}
                recieve-shadow="true"
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
            ></lume-obj-model>

            <lume-fbx-model
                src={player_ref}
                rotation={`0 0 0`}
                align-point="0.5 0.5"
            ></lume-fbx-model>

            <lume-gltf-model
                src={thingy}
                align-point="0.5 0.5"
                position="0 -20 0"
            ></lume-gltf-model>
        </lume-scene>
    )
}