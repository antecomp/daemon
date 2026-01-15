import { render } from 'solid-js/web';
import './navtile-painter.css';
import '@/shared/styles/base.css'
import 'lume';
import world from '@/scenes/Test/assets/world.glb';

//import bridge from '@/scenes/Bridge/assets/bridge_bake_att2X.fbx'
import { NavMap, TEST_NAVMAP } from '@/3d/tilenav/tilenav.types';
import NavTilePreviewer from '@/3d/tilenav/NavTilePreviewer';
import { createStore } from 'solid-js/store';
import { createSignal } from 'lume';
import { Coord2D } from '@/shared/types/3d.types';

export default function NavTilePainter() {

    const [nm, setNm] = createStore<NavMap>(
        {
            config: {
                playerHeight: 10,
                size: 100,
                numTiles: 10,
                offset: { x: 0, y: 0, z: 0 },
                spawn: `0,0`
            },
            tiles: {}
        }
    );

    const [selectedTiles, setSelectedTiles] = createSignal<Coord2D[]>([]);
    const [hoveredTile, setHoveredTile] = createSignal<Coord2D | null>(null);
    const [clipMode, setClipMode] = createSignal<boolean>(true);


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

                    <lume-ambient-light intensity={1} />

                    <lume-gltf-model
                        align-point="0.5 0.5"
                        scale="100 100 100"
                        src={world}
                    />

                    <NavTilePreviewer NM={TEST_NAVMAP} hoveredTile={hoveredTile()} clip={clipMode()}/>

                </lume-scene>
                <button
                    style={{
                        position: 'absolute',
                        top: '3px',
                        left: '3px'
                    }}
                    onClick={() => setClipMode(p => !p)}
                >
                    Toggle Tile Clipping
                </button>
            </div>
            <div id="painter">

            </div>
        </>
    )
}

const domroot = document.getElementById('navtile-painter');
if (domroot) render(() => <NavTilePainter />, domroot);
