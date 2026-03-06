import Freecam from '@/3d/camera/Freecam';
import world from './assets/dgdemo.glb';

import { onMount, Scene } from "lume";
import applyRoomEnvironment from '@/3d/pipeline/applyRoomEnvironment';
import { useDGShader } from '@/3d/pipeline/dgRender';

export default function Demo() {
    let sceneRef!: Scene;

    onMount(() => requestAnimationFrame(() => applyRoomEnvironment(sceneRef)));
    useDGShader(() => sceneRef);


    return (
        <lume-scene
            ref={sceneRef}
            webgl
            shadow-mode="basic"
            id='SCENE'
            physically-correct-lights
            perspective="800"
        >

            <Freecam initialOri={{yaw: -132, pitch: 11}} initialPos={[-52, -57, 44]} sceneRef={sceneRef}/>

            {/* <lume-ambient-light intensity={1}/> */}

            <lume-gltf-model
                align-point="0.5 0.5"
                scale="10 10 10"
                src={world}
            />

        </lume-scene>
    )
}