import { render } from 'solid-js/web';
import './navtile-painter.css';
import '@/shared/styles/base.css'
import 'lume';

import bridge from '@/scenes/Bridge/assets/bridge_bake_att2X.fbx'
import { TEST_NAVMAP } from '@/3d/tilenav/tilenav.types';

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
                    ></lume-camera-rig>

                    <lume-ambient-light intensity={20} />

                    <lume-fbx-model
                        align-point="0.5 0.5"
                        scale="10 10 10"
                        src={bridge}
                    ></lume-fbx-model>





                    {/* Visualize Tilemap Container */}
                    <lume-plane
                        color='red'
                        align-point='0.5 0.5'
                        mount-point='0.5 0.5'
                        rotation='90 0 0'
                        position={
                            TEST_NAVMAP.config.dimensions.offset.x.toString() + " " +
                            TEST_NAVMAP.config.dimensions.offset.y.toString() + " " +
                            TEST_NAVMAP.config.dimensions.offset.z.toString()
                        }
                        size={`${TEST_NAVMAP.config.dimensions.size} ${TEST_NAVMAP.config.dimensions.size}`}
                        sidedness='double'
                        opacity='0.1'
                    />

                </lume-scene>
            </div>
            <div id="painter">

            </div>
        </>
    )
}

const domroot = document.getElementById('navtile-painter');
if (domroot) render(() => <NavTilePainter />, domroot);