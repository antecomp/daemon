import { render } from 'solid-js/web';
import './navtile-painter.css';
import '@/shared/styles/base.css'
import 'lume';

//import bridge from '@/scenes/Bridge/assets/bridge_bake_att2X.fbx'
import { NavCoord, NavMap, NavTileMask } from '@/3d/tilenav/tilenav.types';
import NavTilePreviewer from '@/3d/tilenav/NavTilePreviewer';
import { createStore } from 'solid-js/store';
import { createMemo, createSignal, For, onCleanup, onMount } from 'solid-js';
import downloadObjectAsJson from '@/shared/utils/downloadAsJson';
import { getWSPositionOfTile } from '@/3d/tilenav/tilenav.utils';
import NavTilePainterScene from './NavTilePainterScene';

export default function NavTilePainter() {

    const [nm, setNm] = createStore<NavMap>(
       {
            config: {
                playerHeight: 10,
                size: 1000,
                numTiles: 12,
                offset: { x: 0, y: 20, z: 0 },
                spawn: `0,0`,
                spawnDirection: 0
            },
            tiles: {}
        }
    );

    const [selectedTiles, setSelectedTiles] = createSignal<NavCoord[]>([]);
    const [hoveredTile, setHoveredTile] = createSignal<NavCoord | null>(null);
    const [clipMode, setClipMode] = createSignal<boolean>(false);

    function selectedOrHoveredTiles() {
        const selected = selectedTiles();
        if (selected.length > 0) return selected;
        const hovered = hoveredTile();
        return hovered ? [hovered] : [];
    }

    function createTilesAtSelected() {
        // Many state updates - very laggy and shit
        //selectedTiles().forEach(navcoord => createTile(navcoord));
        const targets = selectedOrHoveredTiles();
        if (targets.length === 0) return;
        setNm('tiles', prev => {
            const toAdd: NavMap['tiles'] = {};
            targets.forEach(nc => {
                if (prev[nc]) return;
                toAdd[nc] = {
                    height: 0, active: true, edges: 0
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
        const targets = selectedOrHoveredTiles();
        if (targets.length === 0) return;
        // cannot call singular deleteTile in a loop : race condition?
        setNm('tiles', Object.fromEntries(
            targets.map(nc => [nc, undefined])
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

    function invertSelection() {
        const n = nm.config.numTiles;
        const current = new Set(selectedTiles());
        const inverted: NavCoord[] = [];
        for (let z = 0; z < n; z++) {
            for (let x = 0; x < n; x++) {
                const key = `${x},${z}` as NavCoord;
                if (!current.has(key)) inverted.push(key);
            }
        }
        setSelectedTiles(inverted);
    }

    // Probably a cleaner way of doing this!
    function toggleEdgesOfSelectedTiles(direction: NavTileMask) {
        const targets = selectedOrHoveredTiles();
        if (targets.length === 0) return;
        setNm('tiles', prev => Object.fromEntries(
            targets.map(nc => {
                const oldTile = prev[nc];
                if (!oldTile) return [nc, undefined];
                const newEdge = oldTile.edges ^ direction;
                return [nc, { ...oldTile, edges: newEdge }]
            })
        ))
    }

    function raiseSelectedTiles() {
        const targets = selectedOrHoveredTiles();
        if (targets.length === 0) return;
        const input = prompt("Raise by how much?", "10");
        const amt = parseInt(input ?? '10');
        if (isNaN(amt)) return;
        else setNm('tiles', prev => Object.fromEntries(
            targets.map(nc => {
                const oldTile = prev[nc];
                if (!oldTile) return [nc, undefined];
                const newHeight = oldTile.height + amt;
                return [nc, { ...oldTile, height: newHeight }]
            })
        ))
    }

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
            case 'A':
                createTilesAtSelected();
                break;
            case 'd':
                setSelectedTiles([]);
                break;
            case 'x':
                deleteSelectedTiles();
                break;
            case 'a':
                selectAll();
                break;
            case 'PageUp':
                raiseSelectedTiles();
                break;
            case 'i':
                invertSelection();
                break;
            case 'c':
                setClipMode(p => !p);
                break;
            case 's':
                setNm('config', { spawn: hoveredTile() ?? '0,0' });
                break;
            case 'l':
                const tileLoc = hoveredTile()
                    ? getWSPositionOfTile(hoveredTile()!, nm)
                    : null
                console.log(tileLoc);
                navigator.clipboard.writeText(String(tileLoc));
                break;
            case 'o':
                const hc = hoveredTile();
                if (!hc || !nm.tiles[hc]) return;
                setNm('tiles', hc, 'occupied', prev => !prev);
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


    function config(property: keyof NavMap['config']) {

        const updt: Partial<NavMap['config']> = {};

        switch (property) {
            case 'playerHeight': {
                const input = prompt("Set Player Height To?", "10");
                const amt = parseInt(input ?? '10');
                updt.playerHeight = amt;
                break;
            }
            case 'size': {
                const input = prompt("Set Navmap Size To?", "1000");
                const amt = parseInt(input ?? '1000');
                updt.size = amt;
                break;
            }
            case 'spawn': {
                const input = prompt("Set Navmap Size To?", "0,0");
                const amt = input?.split(',').map(x => Number(x));
                if (!amt || amt.length != 2 || typeof amt[0] != 'number' || typeof amt[1] != 'number') return;
                updt.spawn = input as NavCoord;
                break;
            }
            case 'numTiles': {
                const input = prompt("Set # of Tiles To?", "10");
                const amt = parseInt(input ?? '10');
                updt.numTiles = amt;
                break;
            }
            case 'offset': {
                const input = prompt("Set offset to?", `${nm.config.offset.x},${nm.config.offset.y},${nm.config.offset.z}`);
                const amt = input?.split(',').map(a => Number(a));
                if (
                    !amt ||
                    amt.length != 3 ||
                    typeof amt[0] != 'number' ||
                    typeof amt[1] != 'number' ||
                    typeof amt[2] != 'number'
                ) return;
                updt.offset = {
                    x: amt[0], y: amt[1], z: amt[2]
                }
            }
        }

        setNm('config', updt);
    }

    async function importNavMapFromFile(file: File) {
        try {
            const text = await file.text();
            const parsed = JSON.parse(text) as NavMap;
            if (!parsed?.config || !parsed?.tiles) return;
            setNm({ config: parsed.config, tiles: parsed.tiles });
            setSelectedTiles([]);
            setHoveredTile(null);
        } catch (err) {
            console.error("Failed to import navmap JSON.", err);
        }
    }

    let importInputRef: HTMLInputElement | undefined;

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

                    <NavTilePainterScene></NavTilePainterScene>

                    {/* ----------------------------------------------------------------------- */}

                    <NavTilePreviewer
                        NM={nm}
                        hoveredTile={hoveredTile()}
                        selectedTiles={selectedTiles()}
                        clip={clipMode()}
                    />

                </lume-scene>
                <p
                    style={{
                        position: 'absolute',
                        border: 'none',
                        padding: '0px',
                        'font-size': '32px',
                        top: '0px',
                        left: '10px'
                    }}
                    onClick={() => setClipMode(p => !p)}
                >
                    {clipMode() ? '○' : '●'}
                </p>
                <p
                    style={{
                        position: 'absolute',
                        border: 'none',
                        padding: '0px',
                        'font-size': '32px',
                        bottom: '5px',
                        left: '5px'
                    }}
                >
                    {hoveredTile()}
                </p>
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
                            const isSpawnPoint = createMemo(() => nm.config.spawn == coordKey);
                            const tile = nm.tiles[coordKey];
                            const edges = tile?.edges ?? 0;
                            const isSelected = () => selectedTiles().includes(coordKey);
                            return (
                                <div
                                    classList={{
                                        'selected': isSelected(),
                                        'exists': nm.tiles[coordKey] != undefined,
                                        'is-spawn': isSpawnPoint(),
                                        'is-occupied': tile?.occupied ?? false
                                    }}
                                    class="painter-tile"
                                    style={{
                                        '--numtiles': nm.config.numTiles,
                                        'border-top-color': (edges & NavTileMask.EDGE_UP) !== 0 ? '#c40000' : '',
                                        'border-right-color': (edges & NavTileMask.EDGE_RIGHT) !== 0 ? '#c40000' : '',
                                        'border-bottom-color': (edges & NavTileMask.EDGE_DOWN) !== 0 ? '#c40000' : '',
                                        'border-left-color': (edges & NavTileMask.EDGE_LEFT) !== 0 ? '#c40000' : '',
                                    }}
                                    onMouseEnter={() => setHoveredTile(coordKey)}
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
                                >{tile?.height}</div>
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
                <hr />
                <div class='config'>
                    <For each={['spawn', 'size', 'playerHeight', 'numTiles', 'offset'] satisfies (keyof NavMap['config'])[]}>
                        {opt => <button onclick={() => config(opt)}>Configure {opt}|{JSON.stringify(nm.config[opt])}</button>}
                    </For>
                </div>
                <hr />
                <input
                    ref={el => (importInputRef = el)}
                    type="file"
                    accept="application/json"
                    style={{ display: 'none' }}
                    onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        if (!file) return;
                        void importNavMapFromFile(file);
                        event.currentTarget.value = '';
                    }}
                />
                <button class="import" onclick={() => importInputRef?.click()}>IMPORT</button>
                <button class="export" onclick={() => downloadObjectAsJson(nm, 'NM')}>EXPORT</button>
            </div>
        </>
    )
}

const domroot = document.getElementById('navtile-painter');
if (domroot) render(() => <NavTilePainter/>, domroot);
