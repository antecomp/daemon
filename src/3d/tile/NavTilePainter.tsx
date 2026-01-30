import { createStore } from "solid-js/store";
import { Direction, NavCoord, NavMap, NavTileMask, StepSFXCategory, StepSFXNames } from "./tilenav.types";
import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount } from "solid-js";
import NavTilePreviewer, { WINDOW_HALF_SIZE_TILES, WINDOW_SIZE_TILES } from "./NavTilePreviewer";

import './navtile-painter.css'
import '@/shared/styles/base.css'
import NavTilePreviewCamera from "./NavTilePreviewCamera";
import PainterPreviewMap from "./PainterPreviewMap";
import downloadObjectAsJson from "@/shared/utils/downloadAsJson";

import 'lume'
import { render } from "lume";

const GRID_COORDS: [number, number][] = (() => {
    const coords: [number, number][] = [];
    for (let z = -WINDOW_HALF_SIZE_TILES; z <= WINDOW_HALF_SIZE_TILES; z++) {
        for (let x = -WINDOW_HALF_SIZE_TILES; x <= WINDOW_HALF_SIZE_TILES; x++) {
            coords.push([x, z]);
        }
    }
    return coords;
})();

export default function NavTilePainter() {
    const [nm, setNm] = createStore<NavMap>({
        config: {
            playerHeight: 10,
            tileSize: 10,
            offset: { x: 0, y: 0, z: 0 },
            spawn: "0,0",
            spawnDirection: Direction.NORTH
        },
        tiles: {}
    });

    const [selectedTiles, setSelectedTiles] = createSignal<NavCoord[]>([]);
    const selectedTilesSet = createMemo(() => new Set(selectedTiles()));

    const [hoveredTile, setHoveredTile] = createSignal<NavCoord | null>(null);
    const [clipMode, setClipMode] = createSignal<boolean>(false);

    const [currentChunk, setCurrentChunk] = createSignal<[number, number]>([0, 0]);
    const chunkTileOffsetX = createMemo(() => currentChunk()[0] * WINDOW_SIZE_TILES)
    const chunkTileOffsetZ = createMemo(() => currentChunk()[1] * WINDOW_SIZE_TILES)

    createEffect(on(currentChunk, () => {
        setSelectedTiles([]);
    }));

    // Where in Chunk-Space, needs to be offset based on current chunk
    const selectTile = (whereCSX: number, whereCSZ: number) => setSelectedTiles(prev => {
        const whereX = whereCSX + chunkTileOffsetX();
        const whereZ = whereCSZ + chunkTileOffsetZ();
        return [...prev, `${whereX},${whereZ}`];
    });
    const deselectTile = (whereCSX: number, whereCSZ: number) => setSelectedTiles(prev => {
        const where: NavCoord = `${whereCSX + chunkTileOffsetX()},${whereCSZ + chunkTileOffsetZ()}`
        return prev.filter(loc => loc != where);
    });

    function selectAll() {
        const n = WINDOW_HALF_SIZE_TILES;
        const coords: NavCoord[] = [];
        for (let z = -n; z <= n; z++) {
            for (let x = -n; x <= n; x++) {
                coords.push(`${x + chunkTileOffsetX()},${z + chunkTileOffsetZ()}` as NavCoord);
            }
        }
        setSelectedTiles(coords);
    };

    function invertSelection() {
        const n = WINDOW_HALF_SIZE_TILES;
        const current = new Set(selectedTiles());
        const inverted: NavCoord[] = [];
        for (let z = -n; z <= n; z++) {
            for (let x = -n; x <= n; x++) {
                const key = `${x + chunkTileOffsetX()},${z + chunkTileOffsetZ()}` as NavCoord;
                if (!current.has(key)) inverted.push(key);
            }
        }
        setSelectedTiles(inverted);
    }

    function selectedOrHoveredTiles() {
        const selected = selectedTiles();
        if (selected.length > 0) return selected;
        const hovered = hoveredTile();
        return hovered ? [hovered] : [];
    }

    function createTilesAtSelected() {
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

    function setTileSound() {
        const targets = selectedOrHoveredTiles();
        if (targets.length === 0) return;
        const input = prompt("Set to what sound type? \n " + `"carpet" | "dirt" | "floor" | "gravel" | "snow" | "tiles" | "water" | "wood"`);
        if (StepSFXNames.some(x => x === input)) {
            setNm('tiles', prev => Object.fromEntries(
                targets.map(nc => {
                    const oldTile = prev[nc];
                    if (!oldTile) return [nc, undefined];
                    return [nc, { ...oldTile, stepSfx: (input as StepSFXCategory) }]
                })
            ))
        }
    }


    function config(property: keyof NavMap['config']) {
        const updt: Partial<NavMap['config']> = {};

        switch (property) {
            case 'playerHeight': {
                const input = prompt("Set Player Height To?", "10");
                const amt = parseInt(input ?? '10');
                updt.playerHeight = amt;
                break;
            }
            case 'tileSize': {
                const input = prompt("Set Size of tiles to?", "10");
                const amt = parseInt(input ?? '10');
                updt.tileSize = amt;
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

    let importInputRef: HTMLInputElement | undefined;
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

    // User Interaction --------------------
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
                if (isShiftDown) toggleEdgesOfSelectedTiles(NavTileMask.EDGE_DOWN);
                else setCurrentChunk(prev => [prev[0], prev[1] + 1]);
                break;
            case 'ArrowUp':
                if (isShiftDown) toggleEdgesOfSelectedTiles(NavTileMask.EDGE_UP);
                else setCurrentChunk(prev => [prev[0], prev[1] - 1]);
                break;
            case 'ArrowLeft':
                if (isShiftDown) toggleEdgesOfSelectedTiles(NavTileMask.EDGE_LEFT);
                else setCurrentChunk(prev => [prev[0] - 1, prev[1]]);
                break;
            case 'ArrowRight':
                if (isShiftDown) toggleEdgesOfSelectedTiles(NavTileMask.EDGE_RIGHT);
                else setCurrentChunk(prev => [prev[0] + 1, prev[1]]);
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
            case 'r':
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
                    // TODO: RESTORE FUNC
                    //? getWSPositionOfTile(hoveredTile()!, nm)
                    ? console.error('Need to implement getWSPositionOfTile')
                    : null
                console.log(tileLoc);
                navigator.clipboard.writeText(String(tileLoc));
                break;
            case 'o':
                const hc = hoveredTile();
                if (!hc || !nm.tiles[hc]) return;
                setNm('tiles', hc, 'occupied', prev => !prev);
                break;
            case 'S':
                setTileSound();
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
                    shadow-mode='basic'
                    id='SCENE'
                    physically-correct-lights
                    perspective='800'
                >

                    <NavTilePreviewCamera
                        chunk={currentChunk()}
                        chunkWSSize={WINDOW_SIZE_TILES * nm.config.tileSize}
                    />

                    <PainterPreviewMap />

                    <NavTilePreviewer
                        NM={nm}
                        hoveredTile={hoveredTile()}
                        selectedTiles={selectedTiles()}
                        clip={clipMode()}
                        chunk={currentChunk()}
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
                        "grid-template-columns": `repeat(${WINDOW_SIZE_TILES}, minmax(0, 1fr))`,
                        "grid-template-rows": `repeat(${WINDOW_SIZE_TILES}, minmax(0, 1fr))`
                    }}
                >
                    <For each={GRID_COORDS}>
                        {([x, z]) => {
                            const coordKey = createMemo(() => `${x + chunkTileOffsetX()},${z + chunkTileOffsetZ()}` as NavCoord);
                            const tile = createMemo(() => nm.tiles[coordKey()]);
                            const edges = () => tile()?.edges ?? 0;
                            const isSelected = () => selectedTilesSet().has(coordKey());
                            return (
                                <div
                                    class="painter-tile"
                                    classList={{
                                        'selected': isSelected(),
                                        'exists': tile() != undefined,
                                        'is-spawn': nm.config.spawn === coordKey(),
                                        'is-occupied': tile()?.occupied ?? false
                                    }}
                                    style={{
                                        'border-top-color': (edges() & NavTileMask.EDGE_UP) !== 0 ? '#c40000' : '',
                                        'border-right-color': (edges() & NavTileMask.EDGE_RIGHT) !== 0 ? '#c40000' : '',
                                        'border-bottom-color': (edges() & NavTileMask.EDGE_DOWN) !== 0 ? '#c40000' : '',
                                        'border-left-color': (edges() & NavTileMask.EDGE_LEFT) !== 0 ? '#c40000' : '',
                                    }}
                                    onMouseEnter={() => setHoveredTile(coordKey())}
                                    onMouseLeave={() => setHoveredTile(null)}
                                    onPointerDown={() => {
                                        isPointerDown = true;
                                        isShiftDown ? deselectTile(x, z) : selectTile(x, z);
                                    }}
                                    onPointerEnter={() => {
                                        if (isPointerDown) {
                                            isShiftDown ? deselectTile(x, z) : selectTile(x, z);
                                        }
                                    }}
                                    onPointerUp={() => {
                                        isPointerDown = false;
                                    }}
                                >{tile()?.height}</div>
                            );
                        }}
                    </For>
                </div>
                <div class='actions'>
                    <button onclick={selectAll}>Select All</button>
                    <button onclick={() => setSelectedTiles([])}>Clear Selection</button>
                    <button onclick={createTilesAtSelected}>Place new tiles at selected</button>
                    <button onclick={deleteSelectedTiles}>Delete Selected Tiles</button>
                </div>
                <hr />
                <div class='config'>
                    <For each={['tileSize', 'playerHeight', 'offset'] satisfies (keyof NavMap['config'])[]}>
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
if (domroot) render(() => <NavTilePainter />, domroot);
