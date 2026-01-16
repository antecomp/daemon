import world from './assets/world.glb';
import NM from './assets/NM.json';
import PlayerCam from '@/3d/camera/PlayerCam';
import createTileNavigator from '@/3d/tilenav/createTileNavigator';
import { NavMap } from '@/3d/tilenav/tilenav.types';
import { Scene } from 'lume';
import NavTilePreviewer from '@/3d/tilenav/NavTilePreviewer';
import girl_sprite from './assets/yeah.png';
import { useDGShader } from '@/3d/pipeline/dgRender';
import Freecam from '@/3d/camera/Freecam';
import Billboard from '@/3d/components/Billboard';
import { addLogMessage } from '@/app/shell/hud/EventLog';
import { DialogueNode } from '@/core/dialogue/dialogueNode.types';
import { makeDialogueNode } from '@/core/dialogue/dialogueNode';
import { createDialogueWithCamOvr } from '@/3d/camera/dialogueCamera';
import { playSound } from '@/shared/utils/playSound';

import yeah_sound from './assets/yeah.ogg'
import NavCompass from '@/3d/tilenav/NavCompass';

const dr: DialogueNode = makeDialogueNode('Hello.', 'Strange Girl');

export default function Test() {

    const { cameraControlSignals, cameraController, navController } = createTileNavigator(NM as NavMap);
    let sceneRef!: Scene;
    useDGShader(() => sceneRef, 'normal')

    const grlc = createDialogueWithCamOvr(cameraController, {
        pos: [-482, -55, -24],
        ori: { yaw: 216, pitch: 0 },
    }, dr)

    return (
        <>
        <NavCompass nc={navController}/>
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
                    {...cameraControlSignals()}
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
                            () => playSound(yeah_sound),
                            //() => addLogMessage('she has nothing to say'),
                            () => grlc.start(),
                            () => addLogMessage('You don\'t know why, but her presence fills you with rage', 'red')
                        ]
                    }
                />

                {/* <NavTilePreviewer NM={NM as NavMap}/> */}
            </lume-scene>
        </>
    )
}
