import { render } from 'solid-js/web';
import { For } from 'solid-js'
import './navtile-painter.css';
import '@/shared/styles/base.css'
import 'lume';

import bridge from '@/scenes/Bridge/assets/bridge_bake_att2X.fbx'
import { TEST_NAVMAP as TC } from '@/3d/tilenav/tilenav.types';

export default function NavTilePainter() {

    const TILE_SIZE = TC.config.dimensions.size / TC.config.dimensions.numTiles;
    const halfSize = TC.config.dimensions.size / 2;
    const tileOffset = TILE_SIZE / 2;
    const baseX = TC.config.dimensions.offset.x - halfSize + tileOffset;
    const baseY = TC.config.dimensions.offset.y;
    const baseZ = TC.config.dimensions.offset.z - halfSize + tileOffset;

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
                    {/* <lume-plane
                        color='red'
                        align-point='0.5 0.5'
                        mount-point='0.5 0.5'
                        rotation='90 0 0'
                        position={
                            TC.config.dimensions.offset.x.toString() + " " +
                            TC.config.dimensions.offset.y.toString() + " " +
                            TC.config.dimensions.offset.z.toString()
                        }
                        size={`${TC.config.dimensions.size} ${TC.config.dimensions.size}`}
                        sidedness='double'
                        opacity='0.1'
                    /> */}

                    <For each={Object.entries(TC.tiles)}>
                        {([coord, tile]) => {
                            const [tx, tz] = coord.split(',').map(Number);
                            const x = baseX + tx * TILE_SIZE;
                            const y = baseY - tile.height //- 20;
                            const z = baseZ + tz * TILE_SIZE;
                            const color = (tx + tz) % 2 === 0 ? '#529958' : '#70ca96';
                            return (
                                <lume-plane
                                    color={color}
                                    align-point='0.5 0.5'
                                    mount-point='0.5 0.5'
                                    rotation='90 0 0'
                                    position={`${x} ${y} ${z}`}
                                    size={`${TILE_SIZE} ${TILE_SIZE}`}
                                    opacity='0.5'
                                />
                            )
                        }}
                    </For>

                </lume-scene>
            </div>
            <div id="painter">

            </div>
        </>
    )
}

const domroot = document.getElementById('navtile-painter');
if (domroot) render(() => <NavTilePainter />, domroot);
