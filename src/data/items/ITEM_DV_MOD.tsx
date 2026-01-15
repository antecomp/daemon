import { useDGShader } from "@/3d/pipeline/dgRender";
import { popUILayer, pushUILayer } from "@/app/shell/layers/UILayerManager";
import { setCurrentScene } from "@/app/shell/scene-container/SceneContainer";
import { Item } from "@/core/inventory/Items";
import EnochPuzzle from "@/features/puzzles/enoch/EnochPuzzle";
import cache_model from '@/scenes/GemmaBar/models/cache.fbx'
import pickRandom from "@/shared/utils/pickRandom";
import { Scene } from "lume";

const PUZZLE_ID = 'dv-mod-puzzle';

const ITEM_DV_MOD: Item = {
    category: 'caches',
    icon: 'default',
    displayName: 'dv_mod',
    previewName: 'Daemonveil safegaurd mod',
    uploadable: false,
    action() {

        const getPuzzleText = () => pickRandom(['GARDEN', 'DAEMON', 'ISLAND'])

        //setCurrentScene('Bridge')
        pushUILayer({
            id: PUZZLE_ID,
            blockBehind: true,
            style: { display: 'flex', 'justify-content': 'center', 'align-items': 'center' },
            component: () => <EnochPuzzle
                target={getPuzzleText()}
                onCorrect={() => {popUILayer(PUZZLE_ID); setCurrentScene('Bridge')}}
                onFail={() => {popUILayer(PUZZLE_ID)}}
            />
        })
    },
    actionShouldCloseViewer: true,
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