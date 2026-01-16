import world from './assets/world.glb';
import NM from './assets/NM.json';
import PlayerCam from '@/3d/camera/PlayerCam';
import createTileNavigator from '@/3d/tilenav/createTileNavigator';
import { NavMap } from '@/3d/tilenav/tilenav.types';
import { Scene } from 'lume';
import NavTilePreviewer from '@/3d/tilenav/NavTilePreviewer';
import girl_sprite from './assets/girl2.png';
import { useDGShader } from '@/3d/pipeline/dgRender';
import Freecam from '@/3d/camera/Freecam';
import Billboard from '@/3d/components/Billboard';
import { addLogMessage } from '@/app/shell/hud/EventLog';

export default function Test() {

    const sig = createTileNavigator(NM as NavMap);
    let sceneRef!: Scene;
    useDGShader(() => sceneRef, 'normal')

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
            {/* <Freecam sceneRef={sceneRef} initialPos={[-45, -81, -98]} initialOri={{yaw:-253, pitch:0}}/> */}

            <lume-ambient-light intensity={4} />

            <lume-gltf-model
                align-point="0.5 0.5"
                scale="100 100 100"
                src={world}
            />

            <Billboard
                texture={girl_sprite}
                position='-450 -20 -2'
                scale={90}
                interactions={
                    [
                        () => addLogMessage('hello.'),
                        () => addLogMessage('she has nothing to say'),
                        () => addLogMessage('you don\'t know why, but her presence fills you with rage', 'red')
                    ]
                }
            />

            {/* <NavTilePreviewer NM={NM as NavMap}/> */}
        </lume-scene>
    )
}