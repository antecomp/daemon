import { render } from 'solid-js/web';
import './navtile-painter.css';
import '@/shared/styles/base.css'
import 'lume';
import world from '@/scenes/Test/assets/world.glb';

//import bridge from '@/scenes/Bridge/assets/bridge_bake_att2X.fbx'
import { NavCoord, NavMap, NavTileMask, TEST_NAVMAP } from '@/3d/tilenav/tilenav.types';
import NavTilePreviewer from '@/3d/tilenav/NavTilePreviewer';
import { createStore } from 'solid-js/store';
import { createSignal, onCleanup, onMount } from 'lume';
import { Coord2D } from '@/shared/types/3d.types';

export default function NavTilePainter() {

    const [nm, setNm] = createStore<NavMap>(
        // {
        //     config: {
        //         playerHeight: 10,
        //         size: 1250,
        //         numTiles: 10,
        //         offset: { x: 0, y: 20, z: 0 },
        //         spawn: `0,0`
        //     },
        //     tiles: {}
        // }
        TEST_NAVMAP
    );

    const [selectedTiles, setSelectedTiles] = createSignal<NavCoord[]>([]);
    const [hoveredTile, setHoveredTile] = createSignal<Coord2D | null>(null);
    const [clipMode, setClipMode] = createSignal<boolean>(false);

    const createTile = (where: Coord2D) => {
        setNm('tiles', prev => {
            const coords = where.join(',') as NavCoord;
            if (prev[coords]) return prev; // tile already there
            return {...prev, [coords]: {
                height: 0, active: true, edges: 15
            }}
        })
    }

    // const toggleSelectTile = (where: NavCoord) => {
    //     setSelectedTiles(prev => {
    //         if (prev.includes(where)) return prev.filter(i => i != where)
    //         return [...prev, where]
    //     });
    // }

    const selectTile = (where: NavCoord) => setSelectedTiles(prev => [...prev, where]);

    let isPointerDown = false;
    onMount(() => {
        document.addEventListener('pointerup', () => isPointerDown = false);
        document.addEventListener('pointercancel', () => isPointerDown = false);
    });

    onCleanup(() => {
        document.removeEventListener('pointerup', () => isPointerDown = false);
        document.removeEventListener('pointercancel', () => isPointerDown = false);
    });

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
                        initial-polar-angle='75'
                        distance='2000'
                        max-horizontal-angle='60'
                        min-horizontal-angle='-60'
                        horizontal-angle='0'
                    ></lume-camera-rig>

                    <lume-ambient-light intensity={1} />

                    <lume-gltf-model
                        align-point="0.5 0.5"
                        scale="100 100 100"
                        src={world}
                    />

                    <NavTilePreviewer 
                        NM={nm} 
                        hoveredTile={hoveredTile()} 
                        selectedTiles={selectedTiles()}
                        clip={clipMode()} 
                    />

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
                            const isSelected = () => selectedTiles().includes(coordKey);
                            return (
                                <div
                                    classList={{
                                        'selected': isSelected()
                                    }}
                                    class="painter-tile"
                                    style={{
                                        '--numtiles': nm.config.numTiles,
                                        'border-top-color': (edges & NavTileMask.EDGE_UP) === 0 ? '#c40000' : 'inherit',
                                        'border-right-color': (edges & NavTileMask.EDGE_RIGHT) === 0 ? '#c40000' : 'inherit',
                                        'border-bottom-color': (edges & NavTileMask.EDGE_DOWN) === 0 ? '#c40000' : 'inherit',
                                        'border-left-color': (edges & NavTileMask.EDGE_LEFT) === 0 ? '#c40000' : 'inherit',
                                    }}
                                    onMouseEnter={() => setHoveredTile([x, z])}
                                    onMouseLeave={() => setHoveredTile(null)}
                                    onPointerDown={() => {
                                        isPointerDown = true;
                                        selectTile(coordKey);
                                    }}
                                    onPointerEnter={() => {
                                        if(isPointerDown) selectTile(coordKey)
                                    }}
                                    onPointerUp={() => {
                                        isPointerDown = false;
                                    }}
                                />
                            );
                        })
                    ))}
                </div>
                <button onclick={() => setSelectedTiles([])}>Clear Selection</button>
            </div>
        </>
    )
}

const domroot = document.getElementById('navtile-painter');
if (domroot) render(() => <NavTilePainter />, domroot);
