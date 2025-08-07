import WadsCam from "@/components/lume/wadscam";
import applyDGShader from "@/core/lume/dgRender";
import { Scene } from "lume";
import { onMount } from "solid-js";
import island1 from "./models/island_1.fbx?url"
import island2 from "./models/island_2.fbx?url"
import island3 from "./models/island_3.fbx?url"
import island4 from "./models/island_4.fbx?url"

export default function Crumbling() {
    let sceneRef: Scene | undefined;

    onMount(() => requestAnimationFrame(() => sceneRef && applyDGShader(sceneRef)));

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf"
            perspective="800"
            shadowmap-type="pcf"
            // physically-correct-lights
        >

            <lume-ambient-light intensity={1.0} />
            <lume-point-light
                position="0 -100 0"
                intensity="300"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
            />
            {/* Light below to show detail of underside */}
            <lume-point-light
                position="0 200 0"
                intensity="300"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
            />
            {/* <WadsCam/> */}
            <lume-camera-rig 
                align-point="0.5 0.5"
                min-distance="-100"
            />

            <lume-fbx-model src={island1}
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                size="10 10 10"
                position="175 -50 350"
            />

            <lume-fbx-model src={island2}
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                size="10 10 10"
                position="-25 -20 260"
            />
                <lume-point-light
                    position="-25 -100 260"
                    intensity="200"
                    align-point="0.5 0.5"
                    mount-point="0.5 0.5"
                />
                <lume-point-light
                    position="-25 200 260"
                    intensity="200"
                    align-point="0.5 0.5"
                    mount-point="0.5 0.5"
                />

            <lume-fbx-model src={island3}
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                size="10 10 10"
            />

            <lume-fbx-model src={island4}
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                size="10 10 10"
                position="150 -10 125"
            />
            <lume-box></lume-box>
        </lume-scene>
    )
}