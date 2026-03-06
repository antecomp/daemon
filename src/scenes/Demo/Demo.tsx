import world from './assets/dgdemo.glb';
import devon from './assets/devon.glb';

import NM from './assets/NM.json';

import { Scene } from "lume";
import applyRoomEnvironment from '@/3d/pipeline/applyRoomEnvironment';
import { useDGShader } from '@/3d/pipeline/dgRender';
import createTileNavigator from '@/3d/tilenav/createTileNavigator';
import { NavMap } from '@/3d/tilenav/tilenav.types';
import NavCompass from '@/3d/tilenav/NavCompass';
import PlayerCam from '@/3d/camera/PlayerCam';
import AtTile from '@/3d/tilenav/AtTile';
import Interactable from '@/3d/components/Interactable';
import { DialogueService } from '@/core/dialogue/dialogueService';
import { makeDialogueNode } from '@/core/dialogue/dialogueNode';

export default function Demo() {
    let sceneRef!: Scene;

    applyRoomEnvironment(() => sceneRef);
    useDGShader(() => sceneRef);

    const { cameraControlSignals, navController } = createTileNavigator(NM as NavMap);

    return (
        <>
            <NavCompass nm={navController.navMap} nc={navController} />
            <lume-scene
                ref={sceneRef}
                webgl
                shadow-mode="basic"
                id='SCENE'
                physically-correct-lights
                perspective="800"
            >

                <PlayerCam {...cameraControlSignals()} sceneRef={sceneRef} interactionDistance={30}/>

                <lume-gltf-model
                    align-point="0.5 0.5"
                    scale="10 10 10"
                    src={world}
                />

                <AtTile pos='6,43' nm={navController.navMap} nc={navController}>
                    <Interactable
                        interactions={[,() => DialogueService.startDialogue(makeDialogueNode('hello.', 'Dithon')),]}
                    >
                        <lume-gltf-model
                            id="DEVON"
                            align-point="0.5 0.5"
                            scale="0.6 0.6 0.6"
                            src={devon}
                            position='-3 0 0'
                            rotation="0 300 0"
                        />
                    </Interactable>
                </AtTile>

            </lume-scene>
        </>
    )
}