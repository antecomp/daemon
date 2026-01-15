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
        // {
        //     config: {
        //         playerHeight: 10,
        //         size: 100,
        //         numTiles: 10,
        //         offset: { x: 0, y: 0, z: 0 },
        //         spawn: `0,0`
        //     },
        //     tiles: {}
        // }
        TEST_NAVMAP
    );

    const [selectedTiles, setSelectedTiles] = createSignal<Coord2D[]>([]);
    const [hoveredTile, setHoveredTile] = createSignal<Coord2D | null>([1,5]);
    const [clipMode, setClipMode] = createSignal<boolean>(false);

    const EDGE_UP = 1;
    const EDGE_RIGHT = 2;
    const EDGE_DOWN = 4;
    const EDGE_LEFT = 8;

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

                    <NavTilePreviewer NM={nm} hoveredTile={hoveredTile()} clip={clipMode()} />

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
                <div
                    class="painter-grid"
                    style={{
                        'grid-template-columns': `repeat(${nm.config.numTiles}, minmax(0, 1fr))`,
                        'grid-template-rows': `repeat(${nm.config.numTiles}, minmax(0, 1fr))`,
                    }}
                >
                    {Array.from({ length: nm.config.numTiles }).map((_, z) => (
                        Array.from({ length: nm.config.numTiles }).map((__, x) => {
                            const coordKey = `${x},${z}` as const;
                            const tile = nm.tiles[coordKey];
                            const edges = tile?.edges ?? 15;
                            return (
                                <div
                                    class="painter-tile"
                                    style={{
                                        '--numtiles': nm.config.numTiles,
                                        'border-top-color': (edges & EDGE_UP) === 0 ? '#c40000' : 'inherit',
                                        'border-right-color': (edges & EDGE_RIGHT) === 0 ? '#c40000' : 'inherit',
                                        'border-bottom-color': (edges & EDGE_DOWN) === 0 ? '#c40000' : 'inherit',
                                        'border-left-color': (edges & EDGE_LEFT) === 0 ? '#c40000' : 'inherit',
                                    }}
                                    onMouseEnter={() => setHoveredTile([x, z])}
                                    onMouseLeave={() => setHoveredTile(null)}
                                />
                            );
                        })
                    ))}
                </div>
            </div>
        </>
    )
}

const domroot = document.getElementById('navtile-painter');
if (domroot) render(() => <NavTilePainter />, domroot);
