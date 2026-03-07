import applyRoomEnvironment from "@/3d/pipeline/applyRoomEnvironment";
import { useDGShader } from "@/3d/pipeline/dgRender";
import { ITEM_ICONS } from "@/core/inventory/itemIcons";
import { Item } from "@/core/inventory/Items";
import { Scene } from "lume";

import relic from '@/scenes/Demo/assets/relic_s.glb'
import pickRandom from "@/shared/utils/pickRandom";
import createPopup from "@/app/shell/popup/Popup";

import alert_icon from '@/assets/ui/icons/popup-icons/alert.png';
import { popUILayer, pushUILayer } from "@/app/shell/layers/UILayerManager";
import EnochPuzzle from "@/features/puzzles/enoch/EnochPuzzle";
import { createEmitter } from "@/shared/utils/emitter";
import Inventory from "@/core/inventory/inventory";
import { sidebarLock } from "@/app/shell/locks/UILockManager";

// TODO: THIS IS A VILE HACK. CHANGE HOW THIS WORKS POSTHASTE. AWFUL!
const { emit: emitRelicDecrypt, listen: listenForRelicDecrypt } = createEmitter();
export { listenForRelicDecrypt }

const PUZZLE_ID = 'relic-puzzle';

const POPUP_STYLE = {
    'display': 'grid',
    'width': '325px',
    'gap': '15px',
    'grid-template-columns': 'auto auto',
    'padding': '25px'
}

const ITEM_RELIC: Item = {
    category: 'misc',
    icon: ITEM_ICONS.default,
    displayName: "RELIC",
    previewName: 'A strange relic.',
    uploadable: false,
    action() {
        const getPuzzleText = () => pickRandom(['GARDEN', 'DAEMON', 'ISLAND', 'GOLDEN']);

        const spawnFailPopup = () =>
            createPopup(
                (<div style={POPUP_STYLE}>
                    <img src={alert_icon} />
                    <p>Decryption Failed, passkey may have changed. Try again?</p>
                </div>),
                [
                    {
                        prompt: 'Yes',
                        action: openPuzzle
                    },
                    {
                        prompt: 'No',
                        action: () => undefined // Noop, just close.
                    }
                ]
            );

        const openPuzzle = () =>
            pushUILayer({
                id: PUZZLE_ID,
                blockBehind: true,
                classList: { centered: true },
                component: () => <EnochPuzzle
                    target={getPuzzleText()}
                    onCorrect={spawnSuccessPopup}
                    onFail={() => { popUILayer(PUZZLE_ID); spawnFailPopup() }}
                />
            });

        const spawnSuccessPopup = () => {
            createPopup((<div style={POPUP_STYLE}>
                <img src={alert_icon} />
                <p>Decrytipn Success. The Relic starts to rumble...</p>
            </div>),
                [{
                    prompt: 'OK',
                    action(){ 
                        popUILayer(PUZZLE_ID); 
                        Inventory.removeItem('relic'); 
                        emitRelicDecrypt();

                        // I hate you. Immediately aquire and release sidebar lock to close window.
                        sidebarLock.acquire()()
                    }
                }])
        }

        createPopup(
            (<div style={POPUP_STYLE}>
                <img src={alert_icon} />
                <p>Often items are "encrypted," and you must solve a small puzzle for them to function.</p>
            </div>),
            [
                {
                    prompt: 'Decrypt',
                    action: openPuzzle
                },
                {
                    prompt: 'Cancel',
                    action: () => undefined // noop
                }
            ]
        );

    },
    previewComponent() {
        let sceneRef!: Scene;
        useDGShader(() => sceneRef, 'stable', { width: 290, height: 240 });
        applyRoomEnvironment(() => sceneRef);

        return (
            <div style={{ width: '300px', height: '250px', padding: '5px' }}>
                <lume-scene
                    ref={sceneRef}
                    webgl
                    physically-correct-lights
                    perspective="800"
                    fog-mode="linear"
                    fog-color="#000000"
                    fog-near="600"
                    fog-far="900"
                >
                    <lume-camera-rig
                        align-point="0.5 0.5"
                        distance="10"
                        dolly-speed='0.1'
                    />

                    <lume-gltf-model
                        position="0 0 0"
                        mount-point="0.5 0.5"
                        align-point="0.5 0.5"
                        src={relic}
                        scale="10 10 10"
                    />
                </lume-scene>
            </div>
        )
    }
}

export default ITEM_RELIC;