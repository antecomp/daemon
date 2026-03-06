import world from './assets/dgdemo.glb';
import devon from './assets/devon.glb';

import NM from './assets/NO_ACCESS_NM.json';
import FULL_NM from './assets/NM.json';

import door_l from '@/scenes/Doors/assets/door_l.png';
import door_r from '@/scenes/Doors/assets/door_r.png'
import controls_dia from '@/assets/misc/controls dia.png';

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
import { createEffect, createReaction, createSignal, JSX, onMount, untrack } from 'solid-js';
import createPopup from '@/app/shell/popup/Popup';
import lerp from '@/shared/utils/lerp';
import { InteractionCB } from '@/core/interaction/interactable.types';
import { useSceneMenu } from '@/app/shell/scene-menu/SceneMenuContext';
import { addLogMessage } from '@/app/shell/hud/EventLog';
import sleep from '@/shared/utils/sleep';
import { DGDEV } from '@/devtools/dev';

const DEMO_POPUP_STYLE: JSX.HTMLAttributes<HTMLParagraphElement>['style'] = {
    padding: '10px',
    'padding-top': '20px',
    gap: '10px',
    transform: 'perspective(0px)',
    'text-align': 'center',
    'max-width': '600px'
}

const tutPopup = (content: JSX.Element) => {
    return (
        <p style={DEMO_POPUP_STYLE}>
            {content}
        </p>
    )
}

export default function Demo() {
    let sceneRef!: Scene;

    applyRoomEnvironment(() => sceneRef);
    useDGShader(() => sceneRef);

    const { cameraControlSignals, navController } = createTileNavigator(NM as NavMap);
    const { spawnMenu } = useSceneMenu();

    const [areDoorsOpen, setDoorsOpen] = createSignal(false);
    const doorClickHandler: InteractionCB = (_uv, mouse) => {
        if (areDoorsOpen()) {
            addLogMessage('The doors are stuck open. I cannot get them to move again.')
            return;
        };
        spawnMenu(
            "Open the doors?",
            [
                {
                    label: "Yes",
                    onSelect() {
                        setDoorsOpen(true);
                        addLogMessage("The doors creak loudly as they open.")
                    }
                },
                { label: "No" }
            ],
            mouse
        )
    }

    // onMount(async () => {
    //     await new Promise<void>((resolve) => createPopup(
    //         tutPopup(<p><img src='./logo.png' /> <br />Welcome to daemon.garden! <br/> This is a game I have been developing over the past year. <br/> It runs entirely in your web browser!</p>),
    //         [{ prompt: 'OK', action: resolve }]
    //     ))
    //     await new Promise<void>((resolve) => createPopup(
    //         tutPopup(<p>Let's start by learning some controls. You can click around the scene to interact with objects. Try opening the door ahead of you.</p>),
    //         [{ prompt: 'OK', action: resolve }]
    //     ))
    // });

    // createEffect(() => {
    //     areDoorsOpen() && untrack(() => sleep(500).then(_ => createPopup((
    //         <div
    //             style={{
    //                 'padding': '20px',
    //                 'display': 'flex',
    //                 'gap': '10px',
    //                 'width': '450px',
    //                 'justify-content': 'center',
    //                 'align-items': 'center',
    //             }}
    //         >
    //             <img src={controls_dia} />
    //             <p style={{ transform: 'perspective(0px)' }}>Nice! Now you can walk through the scene using WASD and QE.</p>
    //         </div>
    //     ), undefined, "TUTORIAL")))
    // })

    const [isFightRevealed, setRevealFight] = createSignal(false);
    // Reaction will only run once.
    createReaction(() => {
        navController.setNavMap(FULL_NM as NavMap);
    })(() => isFightRevealed())

    DGDEV.attach(setRevealFight, "SRF");

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

                <PlayerCam {...cameraControlSignals()} sceneRef={sceneRef} interactionDistance={30} />

                <lume-gltf-model
                    align-point="0.5 0.5"
                    scale="10 10 10"
                    src={world}
                />

                <AtTile pos='6,43' nm={navController.navMap} nc={navController}>
                    <Interactable
                        interactions={[, () => DialogueService.startDialogue(makeDialogueNode('hello.', 'Dithon')),]}
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

                <AtTile pos="1,1" nm={navController.navMap} nc={navController} occupying={false}>
                    <lume-box
                        size="9.99 30 10"
                        color="black"
                        align-point="0.5 0.5"
                        mount-point="0.5 1 0.5"
                        //@ts-ignore
                        has="basic-material"
                    >
                    </lume-box>
                </AtTile>

                <AtTile pos="-2,1" nm={navController.navMap} nc={navController} occupying={false}>
                    <lume-box
                        size="9.99 30 10"
                        color="black"
                        align-point="0.5 0.5"
                        mount-point="0.5 1 0.5"
                        //@ts-ignore
                        has="basic-material"
                    >
                    </lume-box>
                </AtTile>

                <AtTile pos='0,1' nm={navController.navMap} nc={navController} occupying={!areDoorsOpen()}>
                    <Interactable interactions={[
                        doorClickHandler
                        // Add other interactions here later.
                    ]}>
                        <lume-plane
                            align-point="0.5 0.5"
                            mount-point="0.5 0.5"
                            origin="1 1"
                            size="10 25 10"
                            position="0 -12 0"
                            has="basic-material"
                            cast-shadow="false"
                            sidedness="double"
                            texture={door_r}
                            id="DRR"
                            //@ts-expect-error
                            rotation={(x, y, z, _t, dt) => [
                                x, areDoorsOpen() ? lerp(y, 90, 5 * (dt / 1000)) : lerp(y, 0, 5 * (dt / 1000)), z
                            ]}
                        />
                    </Interactable>
                </AtTile>

                <AtTile pos='-1,1' nm={navController.navMap} nc={navController} occupying={!areDoorsOpen()}>
                    <Interactable interactions={[
                        doorClickHandler
                        // Add other interactions here later.
                    ]}>
                        <lume-plane
                            align-point="0.5 0.5"
                            mount-point="0.5 0.5"
                            origin="0 0"
                            size="10 25 10"
                            position="0 -12 0"
                            has="basic-material"
                            cast-shadow="false"
                            sidedness="double"
                            texture={door_l}

                            //@ts-expect-error
                            rotation={(x, y, z, _t, dt) => [
                                x, areDoorsOpen() ? lerp(y, -90, 5 * (dt / 1000)) : lerp(y, 0, 5 * (dt / 1000)), z
                            ]}
                        />
                    </Interactable>
                </AtTile>

                <lume-plane
                    align-point="0.5 0.5"
                    mount-point="0.5 1"
                    position='60 -20 365'
                    size="220 70 1"
                    sidedness='double'
                    color="black"
                    id="egg"
                    has="basic-material"

                    //@ts-expect-error
                    opacity={(opacity, _t, dt) => 
                        {console.log(dt, opacity); return isFightRevealed() ? lerp(opacity, 0, 5 * dt / 1000) : 1}
                    }
                />

            </lume-scene>
        </>
    )
}