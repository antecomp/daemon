import { GltfModel, Motor, Scene } from "lume";
import { createEffect, createSignal, onMount, Show } from "solid-js";
// import PlayerCam from "@/components/lume/playerCam/PlayerCam";
import { useDGShader } from "@/3d/pipeline/dgRender";
//import Freecam from "@/3d/camera/Freecam";
import PlayerCam from '@/3d/camera/PlayerCam';
//import NavigationPlane from '@/3d/components/navigation/NavigationPlane';

import world from './assets/bridge_a_bake.glb';
import river from './assets/river.glb'
import island_surface from './assets/island_surface.glb'

import NM from './assets/NEONM.json';
import createTileNavigator from '@/3d/tilenav/createTileNavigator';
import { NavMap } from '@/3d/tilenav/tilenav.types';
import NavCompass from '@/3d/tilenav/NavCompass';
import { ShaderMaterial } from "three";
import river_shader from './assets/river.glsl';
import passthrough_vert from '@/3d/shaders/post-processing/passfog.vert.glsl'
import { addLogMessage } from "@/app/shell/hud/EventLog";
import Clouds from "@/shared/components/Clouds/Clouds";
import windsfx from './assets/wind3.wav';
import { createMusicTrack } from "@/core/audio/createMusicTrack";
import { UniformsLib } from "three";
import { setCurrentScene } from "@/app/shell/scene-container/SceneContainer";

export default function Bridge() {
    let sceneRef!: Scene;

    let riverRef!: GltfModel

    const [hasCrossedBridge, setHasCrossedBridge] = createSignal(false);

    useDGShader(() => sceneRef);

    let sceneTransitionStart = false;

    createEffect(() => {
        // Crossing the bridge.
        if (navController.state().tile == '1,0') {
            if (!hasCrossedBridge()) {
                setHasCrossedBridge(true);
                addLogMessage("The air suddenly feels much heavier.");
            }
        }

        if (navController.state().tile == '22,0' && !sceneTransitionStart) {
            sceneTransitionStart = true;
            setCurrentScene('Islands');
        }
    });

    onMount(() => {

        const uniforms = {
            time: { value: 1.0 },
            map: { value: undefined },
            ...(UniformsLib.fog ?? {}),
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
                    fragmentShader: river_shader,
                    fog: true
                });
            })
        });

        Motor.addRenderTask(elapsed => {
            uniforms.time.value = elapsed * 0.001;
            riverRef.needsUpdate();
        })
    });

    createMusicTrack({ src: windsfx });

    const { cameraControlSignals, navController, navListen, NavContextProvider } = createTileNavigator(NM as NavMap);

    navListen(e => e.type == 'move' && e.target == '13,4' && !e.success && addLogMessage('No turning back now.'));

    //navListen(e => e.type == 'move' && e.success && playStepSound('dirt'));

    return (
        <NavContextProvider>
            <NavCompass/>
            <lume-scene
                webgl
                ref={sceneRef}
                shadow-mode="pcf"
                id='SCENE'
                physically-correct-lights
                perspective="800"
                shadowmap-type="pcfsoft"
            //fog-mode="linear" fog-color="#000000" fog-near="1000" fog-far="1200"
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

                <Show when={hasCrossedBridge()}>
                    <lume-gltf-model
                        align-point="0.5 0.5"
                        mount-point="0.5 0.5"
                        scale="10 10 10"
                        position="1100,0,0"
                        src={island_surface}
                    />
                </Show>

                <Clouds
                    position="0 -1200 0"
                    size="10000 10000 100"
                    initialTime={-100}
                />
            </lume-scene>
        </NavContextProvider>
    )
}
