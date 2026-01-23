import { GltfModel, Motor, Scene } from "lume";
import { createEffect, onMount } from "solid-js";
// import PlayerCam from "@/components/lume/playerCam/PlayerCam";
import { useDGShader } from "@/3d/pipeline/dgRender";
//import Freecam from "@/3d/camera/Freecam";
import PlayerCam from '@/3d/camera/PlayerCam';
//import NavigationPlane from '@/3d/components/navigation/NavigationPlane';

import world from './assets/bridge_a_bake.glb';
import NM from './assets/NM.json';
import createTileNavigator from '@/3d/tilenav/createTileNavigator';
import { NavMap } from '@/3d/tilenav/tilenav.types';
import NavCompass from '@/3d/tilenav/NavCompass';
import river from './assets/river.glb'
import { ShaderMaterial } from "three";
import river_shader from './assets/river.glsl';
import passthrough_vert from  '@/3d/shaders/post-processing/pass.vert.glsl'

export default function Bridge() {
    let sceneRef!: Scene;

    let riverRef!: GltfModel

    useDGShader(() => sceneRef);

    createEffect(() => {
        if (navController.state().tile == '12,4') {
            console.log('Trigger');
        }
    });

    onMount(() => {

        const uniforms = {
            time: {value: 1.0},
            map: {value: undefined}
        }

        riverRef?.on('MODEL_LOAD', () => {
            riverRef.three.traverse(n => {
                //@ts-ignore // (property does exist but it's not typed in)
                if (!n.isMesh) return;
                //@ts-expect-error // (property does exist but it's not typed in)
                const originalMat = n.material;
                const map = originalMat.map;
                uniforms.map.value = map;
                //@ts-expect-error // (property does exist but it's not typed in)
                n.material = new ShaderMaterial({
                    uniforms,
                    vertexShader: passthrough_vert,
                    fragmentShader: river_shader
                })
            })
        });

        Motor.addRenderTask(elapsed => {
            uniforms.time.value = elapsed * 0.001;
            riverRef.needsUpdate();
        })
    })

    const { cameraControlSignals, navController } = createTileNavigator(NM as NavMap);

    return (
        <>
            <NavCompass nc={navController} nm={NM as NavMap} />
            <lume-scene
                webgl
                ref={sceneRef}
                shadow-mode="pcf"
                id='SCENE'
                physically-correct-lights
                perspective="800"
                shadowmap-type="pcfsoft"
                fog-mode="linear" fog-color="#000000" fog-near="600" fog-far="1200"
            >
                <PlayerCam {...cameraControlSignals()} sceneRef={sceneRef} />
                {/* <Freecam sceneRef={sceneRef!} /> */}
                <lume-ambient-light intensity={3} />
                <lume-gltf-model
                    align-point="0.5 0.5"
                    scale="10 10 10"
                    src={world}
                />
                <lume-gltf-model
                    align-point="0.5 0.5"
                    scale="10 10 10"
                    src={river}
                    ref={riverRef}
                />
            </lume-scene>
        </>
    )
}
