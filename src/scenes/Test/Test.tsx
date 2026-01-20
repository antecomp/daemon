import world from './assets/world.glb';
import NM from './assets/NM.json';
import PlayerCam from '@/3d/camera/PlayerCam';
import createTileNavigator from '@/3d/tilenav/createTileNavigator';
import { NavMap } from '@/3d/tilenav/tilenav.types';
import { Scene } from 'lume';
import girl_sprite from './assets/yeah.png';
import { useDGShader } from '@/3d/pipeline/dgRender';
import Billboard from '@/3d/components/Billboard';
import { addLogMessage } from '@/app/shell/hud/EventLog';
import { makeDialogueNode } from '@/core/dialogue/dialogueNode';
import { createDialogueWithCamOvr } from '@/3d/camera/dialogueCamera';
import { playSound } from '@/shared/utils/playSound';

import yeah_sound from './assets/yeah.ogg'
import NavCompass from '@/3d/tilenav/NavCompass';
import { CameraSettings } from '@/3d/camera/camera.types';
//import attachToConsole from '@/devtools/attachToConsole';
import { navCoordToTuple } from '@/3d/tilenav/tilenav.utils';

import viya_texture from "@/assets/artwork/characters/viya.png"

const dr = makeDialogueNode('Hello.', 'Strange Girl');
import viya_root from '@/tests/dialogues/v'
import attachToConsole from '@/devtools/attachToConsole';

export default function Test() {

    const { cameraControlSignals, cameraController, navController } = createTileNavigator(NM as NavMap);
    let sceneRef!: Scene;
    useDGShader(() => sceneRef, 'normal');

    const necoCam: CameraSettings = {
        "pos": [
            -497,
            -50,
            -39
        ],
        "ori": {
            "yaw": 216,
            "pitch": 0
        },
        //'anim': false
    };
    const necoDia = createDialogueWithCamOvr(cameraController, necoCam, dr);

    const viyaCam: CameraSettings = {
        pos: [470, -56, -8],
        ori: { yaw: 90, pitch: 0 },
        anim: false,
    }
    const viyaDialogue = createDialogueWithCamOvr(cameraController, viyaCam, viya_root, {fadeTransition: true});

    // You can edit the ovrCam in realtime in the console to test positions!
    //attachToConsole(ovrCam, 'OVR');

    attachToConsole(viyaCam, 'OVR');

    return (
        <>
            <NavCompass nc={navController} nm={navController.navMap} />
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
                    interactionDistance={120}
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
                            () => {
                                if (navCoordToTuple(navController.state().tile)[1] === 8) {
                                    necoCam.pos = [-482, -55, 46];
                                    necoCam.ori = { "yaw": -54, "pitch": 0 }
                                } else {
                                    {
                                        necoCam.pos = [-497, -50, -39];
                                        necoCam.ori = { "yaw": 216, "pitch": 0 }
                                    }
                                }
                                necoDia.start();
                            },
                            () => addLogMessage('You don\'t know why, but her presence fills you with rage', 'red')
                        ]
                    }
                />

                <Billboard
                    texture={viya_texture}
                    position="433 -20 1"
                    scale={100}
                    interactions={[
                        () => addLogMessage(`She doesn't take too kindly to your prodding.`, 'red'),
                        () => {
                            viyaDialogue.start();
                        },
                        () => addLogMessage(`She is smoking a cigarette.`)
                    ]}
                />

                {/* <NavTilePreviewer NM={NM as NavMap}/> */}
            </lume-scene>
        </>
    )
}
