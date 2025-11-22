import bridge from './assets/bridge_bake_att2X.fbx'
import { Scene } from "lume";
import { onMount } from "solid-js";
// import PlayerCam from "@/components/lume/playerCam/PlayerCam";
import { useDGShader } from "@/3d/pipeline/dgRender";
//import Freecam from "@/3d/camera/Freecam";
import createCameraController from '@/3d/camera/createCameraController';
import PlayerCam from '@/3d/camera/PlayerCam';
import NavigationGraph from '@/3d/components/navigation/NavigationGraph';
//import NavigationPlane from '@/3d/components/navigation/NavigationPlane';

export default function Sponza() {
    let sceneRef!: Scene;

    onMount(() => useDGShader(() => sceneRef));

    const { cameraController, cameraControlSignals } = createCameraController([582, -111, -2099], { yaw: -210, pitch: -1 }, { maxYaw: 20, maxPitch: 20 });

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            shadow-mode="basic"
            id='SCENE'
            physically-correct-lights
            perspective="800"
        >

            <PlayerCam {...cameraControlSignals()} sceneRef={sceneRef}/>
            {/* <Freecam sceneRef={sceneRef!} /> */}

            <lume-ambient-light intensity={20} />

            <NavigationGraph
                cameraController={cameraController}
                initial='init'
                graph={{
                    'init': {
                        planePosition: [0,0,0],
                        planeSize: 0,
                        connected: ['x']
                    },
                    'x': {
                        planePosition: [862, -123, -361],
                        planeSize: 700,
                        // show: true,
                        anim: true,
                        newPos: [862, -123, -361],
                        newOri: {yaw: -243, pitch: 0},
                        connected: ['y']
                    },
                    'y': {
                        planePosition:  [554, -177, -168],
                        planeSize: 500,
                        // show: true,
                        anim: true,
                        newPos: [554, -177, -168],
                        newOri: {yaw: -268, pitch: -3},
                        connected: []
                    }
                }}
            />

            <lume-fbx-model
                align-point="0.5 0.5"
                scale="10 10 10"
                src={bridge}
            ></lume-fbx-model>

        </lume-scene>
    )
}