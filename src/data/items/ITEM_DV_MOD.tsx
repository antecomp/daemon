import { useDGShader } from "@/3d/pipeline/dgRender";
import { popUILayer, pushUILayer } from "@/app/shell/layers/UILayerManager";
import createPopup from "@/app/shell/popup/Popup";
import { Item, ITEM_ICONS } from "@/core/inventory/Items";
import EnochPuzzle from "@/features/puzzles/enoch/EnochPuzzle";
import cache_model from '@/scenes/GemmaBar/models/cache.fbx'
import pickRandom from "@/shared/utils/pickRandom";
import { Scene } from "lume";
import alert_icon from '@/assets/ui/icons/popup-icons/alert.png';
import { JSX } from "solid-js";
import decrypt_textscene from '@/scenes/TheGem/data/decrypt_textscene.ts'
import { playTextOverlay } from "@/features/text-overlay/TextOverlay";
import controls_dia from '@/assets/misc/controls dia.png';
import { BOTTOMBAR_HEIGHT } from "@/config/ui.config";

const PUZZLE_ID = 'dv-mod-puzzle';

const POPUP_STYLE: JSX.CSSProperties = {
    'display': 'grid',
    'width': '325px',
    'gap': '15px',
    'grid-template-columns': 'auto auto',
    'padding': '25px'
}

const ITEM_DV_MOD: Item = {
    category: 'caches',
    icon: ITEM_ICONS.default,
    displayName: 'dv_mod',
    previewName: 'Daemonveil safegaurd mod',
    uploadable: false,
    actionShouldCloseViewer: false,
    action() {

        const getPuzzleText = () => pickRandom(['GARDEN', 'DAEMON', 'ISLAND', 'SINNER'])

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

        const spawnSuccessPopup = () =>
            createPopup((<div style={POPUP_STYLE}>
                <img src={alert_icon} />
                <p>Decryption Success. Cache contains one executable.</p>
            </div>),
                [{
                    prompt: 'Run',
                    action() {
                        popUILayer(PUZZLE_ID);
                        playTextOverlay(decrypt_textscene).finally(() => createPopup((
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
                                <p style={{ 'transform': 'perspective(0px)' }}>Cardinal Controls Now Available.</p>
                            </div>), undefined, "NOTE"))
                    }
                }]
            )

        const openPuzzle = () =>
            pushUILayer({
                id: PUZZLE_ID,
                blockBehind: true,
                // TODO: MAKE THIS A COMMON CLASS FOR UI LAYERS WE CAN APPLY TO CENTER CHILDREN.
                style: { display: 'flex', 'justify-content': 'center', 'align-items': 'center', 'padding-bottom': BOTTOMBAR_HEIGHT + "px" },
                component: () => <EnochPuzzle
                    target={getPuzzleText()}
                    onCorrect={spawnSuccessPopup}
                    onFail={() => { popUILayer(PUZZLE_ID); spawnFailPopup() }}
                />
            });

        createPopup(
            (<div style={POPUP_STYLE}>
                <img src={alert_icon} />
                <p>Unable to read or execute cache. Data is encrypted. Attempt to decrypt?</p>
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
        return (
            <div style={{ width: '300px', height: '250px', padding: '5px' }}>
                <div

                ></div>
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
                        distance="175"
                        dolly-speed='0.1'
                    >
                    </lume-camera-rig>
                    <lume-ambient-light intensity='100' />
                    <lume-directional-light
                        align-point="0.5 0.5"
                        position="25 -40 -10"
                        intensity={125}
                    />
                    <lume-directional-light
                        align-point="0.5 0.5"
                        position="25 -40 10"
                        intensity={125}
                    />
                    <lume-fbx-model
                        position="0 0 0"
                        rotation="-45 0 45"
                        src={cache_model}
                        scale="0.5 0.5 0.5"
                        mount-point="0.5 0.5"
                        align-point="0.5 0.5"
                    />
                </lume-scene>
            </div>
        )
    }
}

export default ITEM_DV_MOD;