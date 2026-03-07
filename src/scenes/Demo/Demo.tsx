import world from './assets/dgdemo.glb';
import devon from './assets/devon.glb';

import NM from './assets/NO_ACCESS_NM.json';
import FULL_NM from './assets/NM.json';

import door_l from '@/scenes/Doors/assets/door_l.png';
import door_r from '@/scenes/Doors/assets/door_r.png'
import controls_dia from '@/assets/misc/controls dia.png';

import relic from './assets/relic.glb';

import { Motor, Plane, Scene } from "lume";
import applyRoomEnvironment from '@/3d/pipeline/applyRoomEnvironment';
import { useDGShader } from '@/3d/pipeline/dgRender';
import createTileNavigator from '@/3d/tilenav/createTileNavigator';
import { NavMap } from '@/3d/tilenav/tilenav.types';
import NavCompass from '@/3d/tilenav/NavCompass';
import PlayerCam from '@/3d/camera/PlayerCam';
import AtTile from '@/3d/tilenav/AtTile';
import Interactable from '@/3d/components/Interactable';
import { EMPTY_RENDER, makeDialogueNode } from '@/core/dialogue/dialogueNode';
import { createEffect, createReaction, createSignal, JSX, onMount, Show, untrack } from 'solid-js';
import createPopup from '@/app/shell/popup/Popup';
import lerp from '@/shared/utils/lerp';
import { InteractionCB } from '@/core/interaction/interactable.types';
import { useSceneMenu } from '@/app/shell/scene-menu/SceneMenuContext';
import { addLogMessage } from '@/app/shell/hud/EventLog';
import sleep from '@/shared/utils/sleep';
import { DGDEV } from '@/devtools/dev';
import { listenForRelicDecrypt } from '@/data/items/ITEM_RELIC';
import Inventory from '@/core/inventory/inventory';
import { navCoordToTuple } from '@/3d/tilenav/tilenav.utils';
import { createDialogueWithCamOvr } from '@/3d/camera/dialogueCamera';
import { startBattle } from '@/features/battle/startBattle';
import { createDialogueBuilder } from '@/core/dialogue/dialogueBuilder';
import { BattleOutcome } from '@/core/battle/model/battle';
import showBattleTutorial from '@/features/battle/tutorial/BattleTutorial';
import { OPPONENT_CROW } from '@/data/battles/crow';

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

enum Characters {
    Dithon = "Dithon",
    Arda = "Arda"
}

const dithonDialogueRoot = createDialogueBuilder("Hello Arda. I am impressed you made it this far", Characters.Dithon);

dithonDialogueRoot
    .chain(
        "But I am afriad there is one last challenge for you.",
        "You see, this game is called daemon garden because it has DAEMONS IN IT.",
        "And you will have to fight plenty of them!"
    )
    .addCar(["What are those", "What are daemons?"], "Daemons are the spirits that populate this realm. Not all of them are friendly.",
        r => {
            let battleOutcome: BattleOutcome;
            return r
                .chain("By the sounds of it, you won't know how to fight them either. I will make sure to throw a tutorial in for you.")
                .then(EMPTY_RENDER)
                .makeNodeWaitFor(async () => battleOutcome = await startBattle(OPPONENT_CROW, showBattleTutorial))
                .do(bn => bn
                    .node.next = () => {
                        switch (battleOutcome) {
                            case (BattleOutcome.PlayerVictory): return makeDialogueNode("Wow, nice job. I'm impressed.", Characters.Dithon);
                            case (BattleOutcome.OpponentVictory): return makeDialogueNode("Damn you suck.", Characters.Dithon);
                            case (BattleOutcome.Draw): return makeDialogueNode("Draw. In a real fight that would still count as a loss.", Characters.Dithon);
                            default: return makeDialogueNode("What.", Characters.Dithon);
                        }
                    }
                )
        }
    )
    .addCar(["Go ahead.", "Go ahead, I've already forsaken plenty of daemons."], "Impressive. I won't waste your time then!",
        r => {
            let battleOutcome: BattleOutcome;
            return r
                .makeNodeWaitFor(async () => battleOutcome = await startBattle(OPPONENT_CROW))
                .do(bn => bn
                    .node.next = () => {
                        switch (battleOutcome) {
                            case (BattleOutcome.PlayerVictory): return makeDialogueNode("Wow, nice job. As expected.", Characters.Dithon);
                            case (BattleOutcome.OpponentVictory): return makeDialogueNode("Damn you suck. I thought you knew what you were doing!", Characters.Dithon);
                            case (BattleOutcome.Draw): return makeDialogueNode("Draw. In a real fight that would still count as a loss.", Characters.Dithon);
                            default: return makeDialogueNode("What.", Characters.Dithon);
                        }
                    }
                )
        }
    )

export default function Demo() {
    let sceneRef!: Scene;

    applyRoomEnvironment(() => sceneRef);
    useDGShader(() => sceneRef);

    const { cameraControlSignals, navController, navListen, cameraController } = createTileNavigator(NM as NavMap);
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

    onMount(async () => {
        await new Promise<void>((resolve) => createPopup(
            tutPopup(<p><img src='./logo.png' /> <br />Welcome to daemon.garden! <br /> This is a game I have been developing over the past year. <br /> It runs entirely in your web browser!</p>),
            [{ prompt: 'OK', action: resolve }]
        ))
        await new Promise<void>((resolve) => createPopup(
            tutPopup(<p>Let's start by learning some controls. You can click around the scene to interact with objects. Try opening the door ahead of you.</p>),
            [{ prompt: 'OK', action: resolve }]
        ))
    });

    createEffect(() => {
        areDoorsOpen() && untrack(() => sleep(500).then(_ => createPopup((
            <div
                style={{
                    'padding': '20px',
                    'display': 'flex',
                    'gap': '10px',
                    'width': '450px',
                    'justify-content': 'center',
                    'align-items': 'center',
                }}
            >
                <img src={controls_dia} />
                <p style={{ transform: 'perspective(0px)' }}>Nice! Now you can walk through the scene using WASD and QE.</p>
            </div>
        ), undefined, "TUTORIAL")))
    })

    const [isFightRevealed, setRevealFight] = createSignal(false);
    // Reaction will only run once.
    createReaction(() => {
        navController.setNavMap(FULL_NM as NavMap);
    })(() => isFightRevealed())

    DGDEV.attach(setRevealFight, "SRF");

    /* currently lume has a bug where deltaTime is not attached for the property animator on opacity.
    See: https://github.com/lume/lume/blob/6336e365f1c02af6316017bcd6d7f79bd2efe13b/src/core/PropertyAnimator.ts#L75
    vs: https://github.com/lume/lume/blob/6336e365f1c02af6316017bcd6d7f79bd2efe13b/src/core/PropertyAnimator.ts#L100

    Since I don't want to deal with patching the package, or using any other hacks. Im just going to shove the opacity change anim in a motor.
    */
    let obfuscationPlane!: Plane;
    onMount(() => {
        Motor.addRenderTask((_t, dt) => {
            if (!obfuscationPlane) {
                return;
            }

            if (isFightRevealed()) {
                const currentOpacity = obfuscationPlane.opacity;
                obfuscationPlane.opacity = lerp(currentOpacity, 0, dt / 2000);
            }
        })
    });

    // gross.
    listenForRelicDecrypt(() => setRevealFight(true));

    const [hasPickedUpRelic, setHasPickedUpRelic] = createSignal(false);

    let hasCrossedItemTrigger = false;
    navListen(e => {
        if (e.type !== 'move' || !e.success) return;
        if (hasCrossedItemTrigger) return;

        const [x, z] = navCoordToTuple(e.target);
        if (x == 2 && 24 < z && z < 29) {
            hasCrossedItemTrigger = true;
            createPopup(tutPopup("There is a strange relic on the table there. You can pick it up by interacting with it."))
        }
    })

    function pickUpRelic() {
        Inventory.addItem('relic');
        setHasPickedUpRelic(true);
        createPopup(tutPopup('Sweet! You can access the item in your "file browser" (inventory), which is opened by clicking the folder icon on the side.'))
    }

    function dithonChatSequence() {
        const OVR = {
            pos: [69, -51, 420] as [number, number, number],
            ori: { yaw: 157, pitch: 4 },
            anim: false
        }
        createDialogueWithCamOvr(cameraController, OVR, dithonDialogueRoot.unwrap(), { fadeTransition: true }).start();
    }

    DGDEV.attach(() => {
        setRevealFight(true)
        dithonChatSequence();
    }, "INSANITY")

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

                {/* <Freecam sceneRef={sceneRef}/> */}

                <lume-gltf-model
                    align-point="0.5 0.5"
                    scale="10 10 10"
                    src={world}
                />

                <AtTile pos='6,43' nm={navController.navMap} nc={navController}>
                    <Interactable
                        interactions={[, dithonChatSequence,]}
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

                <Show when={!hasPickedUpRelic()} >
                    <AtTile pos="5,31" nm={navController.navMap} nc={navController} occupying={false}>
                        <Interactable interactions={[
                            pickUpRelic,
                            () => addLogMessage("Best not to talk to this thing."),
                            () => addLogMessage("A strange relic lies on the table"),
                        ]}>
                            <lume-gltf-model
                                id="pain"
                                position="5 -30 -5"
                                rotation="0 0 0"
                                src={relic}
                                scale="10 10 10"
                                // mount-point="0.5 0.5"
                                align-point="0.5 0.5"
                            />
                        </Interactable>
                    </AtTile>
                </Show>

                <lume-plane
                    ref={obfuscationPlane}
                    align-point="0.5 0.5"
                    mount-point="0.5 1"
                    position='60 -20 365'
                    size="220 70 1"
                    sidedness='double'
                    color="black"
                    id="egg"
                    //@ts-expect-error
                    has="basic-material"
                />

            </lume-scene>
        </>
    )
}