import { render } from 'solid-js/web';
import './navtile-painter.css';
import '@/shared/styles/base.css'
import 'lume';

import bridge from '@/scenes/Bridge/assets/bridge_bake_att2X.fbx'
import { TEST_NAVMAP } from '@/3d/tilenav/tilenav.types';
import NavTilePreviewer from '@/3d/tilenav/NavTilePreviewer';

export default function NavTilePainter() {

    return (
        <>
            <div id="scene-preview">
                <lume-scene
                    webgl
                    shadow-mode="basic"
                    id='SCENE'
                    physically-correct-lights
                    perspective="800"
                >

                    <lume-camera-rig
                        align-point="0.5 0.5 0.5"
                        // distance="1500"
                        max-distance='Infinity'
                        min-distance='0'
                        initial-polar-angle='20'
                        distance='1000'
                    ></lume-camera-rig>

                    <lume-ambient-light intensity={20} />

                    <lume-fbx-model
                        align-point="0.5 0.5"
                        scale="10 10 10"
                        src={bridge}
                    ></lume-fbx-model>

                    <NavTilePreviewer NM={TEST_NAVMAP}/>

                </lume-scene>
            </div>
            <div id="painter">

            </div>
        </>
    )
}

const domroot = document.getElementById('navtile-painter');
if (domroot) render(() => <NavTilePainter />, domroot);
