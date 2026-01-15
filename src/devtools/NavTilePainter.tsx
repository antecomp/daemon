import { render } from 'solid-js/web';
import './navtile-painter.css';
import '@/shared/styles/base.css'
import 'lume';
import world from '@/scenes/Test/assets/world.glb';

//import bridge from '@/scenes/Bridge/assets/bridge_bake_att2X.fbx'
import { NavCoord, NavMap, NavTileMask, TEST_NAVMAP } from '@/3d/tilenav/tilenav.types';
import NavTilePreviewer from '@/3d/tilenav/NavTilePreviewer';
import { createStore } from 'solid-js/store';
import { createSignal, onCleanup, onMount } from 'solid-js';
import { Coord2D } from '@/shared/types/3d.types';
import attachToConsole from './attachToConsole';

export default function NavTilePainter() {

    const [nm, setNm] = createStore<NavMap>(
        {
            config: {
                playerHeight: 10,
                size: 1250,
                numTiles: 12,
                offset: { x: 0, y: 20, z: 0 },
                spawn: `0,0`
            },
            tiles: {}
        }
    );

    const [selectedTiles, setSelectedTiles] = createSignal<NavCoord[]>([]);
    const [hoveredTile, setHoveredTile] = createSignal<Coord2D | null>(null);
    const [clipMode, setClipMode] = createSignal<boolean>(false);

    // const createTile = (where: NavCoord) => {
    //     setNm('tiles', prev => {
    //         if (prev[where]) return prev; // tile already there
    //         return {
    //             ...prev, [where]: {
    //                 height: 0, active: true, edges: 15
    //             }
    //         }
    //     })
    // }

    function createTilesAtSelected() {
        // Many state updates - very laggy and shit
        //selectedTiles().forEach(navcoord => createTile(navcoord));
        setNm('tiles', prev => {
            const toAdd: NavMap['tiles'] = {};
            selectedTiles().forEach(nc => {
                if (prev[nc]) return;
                toAdd[nc] = {
                    height: 0, active: true, edges: 15
                }
            });
            return toAdd;
        })
    }

    // Solid shallow-merges the object in. 
    // So, to remove properties, shallow merge with key: undefined.
    // const deleteTile = (where: NavCoord) => {
    //     setNm('tiles', {[where]: undefined})
    // }
    function deleteSelectedTiles() {
        // cannot call singular deleteTile in a loop : race condition?
        setNm('tiles', Object.fromEntries(
            selectedTiles().map(nc => [nc, undefined])
        ));
        setSelectedTiles([]);
    }

    const selectAll = () => {
        const n = nm.config.numTiles;
        const coords: NavCoord[] = [];
        for (let z = 0; z < n; z++) {
            for (let x = 0; x < n; x++) {
                coords.push(`${x},${z}` as NavCoord);
            }
        }
        setSelectedTiles(coords);
    };

    // Probably a cleaner way of doing this!
    function toggleEdgesOfSelectedTiles(direction: NavTileMask) {
        setNm('tiles', prev => Object.fromEntries(
            selectedTiles().map(nc => {
                const oldTile = prev[nc];
                if(!oldTile) return [nc, undefined];
                const newEdge = oldTile.edges ^ direction;
                return [nc, { ...oldTile, edges: newEdge }]
            })
        ))
    }



    // const toggleSelectTile = (where: NavCoord) => {
    //     setSelectedTiles(prev => {
    //         if (prev.includes(where)) return prev.filter(i => i != where)
    //         return [...prev, where]
    //     });
    // }

    const selectTile = (where: NavCoord) => setSelectedTiles(prev => [...prev, where]);
    const deselectTile = (where: NavCoord) => setSelectedTiles(prev => prev.filter(loc => loc != where));

    let isPointerDown = false;
    let isShiftDown = false;

    const keyDown = (e: KeyboardEvent) => {
        //if (e.key == 'Shift') isShiftDown = true;
        switch (e.key) {
            // Add other keybinds here ez.
            case "Shift":
                isShiftDown = true;
                break;
            case 'ArrowDown':
                toggleEdgesOfSelectedTiles(NavTileMask.EDGE_DOWN);
                break;
            case 'ArrowUp':
                toggleEdgesOfSelectedTiles(NavTileMask.EDGE_UP);
                break;
            case 'ArrowLeft':
                toggleEdgesOfSelectedTiles(NavTileMask.EDGE_LEFT);
                break;
            case 'ArrowRight':
                toggleEdgesOfSelectedTiles(NavTileMask.EDGE_RIGHT);
                break;
        }

    }

    const keyUp = (e: KeyboardEvent) => {
        if (e.key == 'Shift') isShiftDown = false;
    }

    onMount(() => {
        document.addEventListener('pointerup', () => isPointerDown = false);
        document.addEventListener('pointercancel', () => isPointerDown = false);


        window.addEventListener("keydown", keyDown);
        window.addEventListener("keyup", keyUp);
    });

    onCleanup(() => {
        document.removeEventListener('pointerup', () => isPointerDown = false);
        document.removeEventListener('pointercancel', () => isPointerDown = false);
        window.removeEventListener("keydown", keyDown);
        window.removeEventListener("keyup", keyUp);
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
                                        'selected': isSelected(),
                                        'exists': nm.tiles[coordKey] != undefined
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
                                        isShiftDown ? deselectTile(coordKey) : selectTile(coordKey);
                                    }}
                                    onPointerEnter={() => {
                                        if (isPointerDown) {
                                            isShiftDown ? deselectTile(coordKey) : selectTile(coordKey);
                                        }
                                    }}
                                    onPointerUp={() => {
                                        isPointerDown = false;
                                    }}
                                />
                            );
                        })
                    ))}
                </div>
                <div class='actions'>
                    <button onclick={selectAll}>Select All</button>
                    <button onclick={() => setSelectedTiles([])}>Clear Selection</button>
                    <button onclick={createTilesAtSelected}>Place new tiles at selected</button>
                    <button onclick={deleteSelectedTiles}>Delete Selected Tiles</button>
                </div>
            </div>
        </>
    )
}

const domroot = document.getElementById('navtile-painter');
if (domroot) render(() => <NavTilePainter />, domroot);
