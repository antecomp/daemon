import world from './assets/world.glb';
import NM from './assets/NM.json';
import PlayerCam from '@/3d/camera/PlayerCam';
import createTileNavigator from '@/3d/tilenav/createTileNavigator';
import { NavMap } from '@/3d/tilenav/tilenav.types';
import { Scene } from 'lume';

export default function Test() {

    const sig = createTileNavigator(NM as NavMap);
    let sceneRef!: Scene;

    return (
        <lume-scene
                    ref={sceneRef}
                    webgl
                    shadow-mode="basic"
                    id='SCENE'
                    physically-correct-lights
                    perspective="800"
                >

                    <PlayerCam
                        sceneRef={sceneRef}
                        {...sig()}
                    />

                    <lume-ambient-light intensity={1} />

                    <lume-gltf-model
                        align-point="0.5 0.5"
                        scale="100 100 100"
                        src={world}
                    />
        </lume-scene>
    )
}