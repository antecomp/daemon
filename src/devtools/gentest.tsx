import NavTilePreviewer from '@/3d/tilenav/NavTilePreviewer';
import { WINDOW_SIZE_TILES } from "@/3d/tilenav/tilenav.config";
import { Direction, NavMap } from '@/3d/tilenav/tilenav.types';
import EnochPuzzle from '@/features/puzzles/enoch/EnochPuzzle';
import '@/shared/styles/base.css';
import { render } from "solid-js/web";

import 'lume';
import NavTilePreviewCamera from '@/3d/tilenav/NavTilePreviewCamera';

const chunk: [number, number] = [-1,-1];
const hoveredTile: [number, number] = [5,5];

const nm: NavMap = {
    config: {
        playerHeight: 5,
        tileSize: 10,
        offset: {
            x: 0,
            y: 0,
            z: 0
        },
        spawn: '1,1',
        spawnDirection: Direction.NORTH
    },
    tiles: {
        '0,0': {
            edges: 0,
            active: true,
            height: 10
        }
    }
}

const Comp = () =>
    <div
        style={{
            width: '900px',
            height: '800px'
        }}
    >
        <lume-scene
            webgl
            shadow-mode="basic"
            id='SCENE'
            physically-correct-lights
            perspective="800"
            style={{
                display: "block",
                width: "100%",
                height: "100%"
            }}
        >

            <lume-ambient-light intensity={1} />

            <lume-plane
                size="110 110 1"
                color="green"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                rotation="90 0 0"
                position="0 1 0"
            />
            <lume-plane
                size="110 110 1"
                color="orange"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                rotation="90 0 0"
                position="0 1 110"
            />
            <lume-plane
                size="110 110 1"
                color="blue"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                rotation="90 0 0"
                position="-110 1 0"
            />
            <lume-plane
                size="110 110 1"
                color="yellow"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                rotation="90 0 0"
                position="110 1 0"
            />
            <lume-plane
                size="110 110 1"
                color="magenta"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                rotation="90 0 0"
                position="0 1 -110"
            />

            {/* ----------------------------------------------------------------------- */}

            <NavTilePreviewer
                NM={nm}
                hoveredTile={'-6,-6'}
                selectedTiles={[]}
                clip={false}
                chunk={chunk}
            />

            {/* <lume-camera-rig
                align-point="0.5 0.5"
                max-distance='Infinity'
                min-distance='0'
                initial-polar-angle='75'
                distance='250'
                max-horizontal-angle='60'
                min-horizontal-angle='-60'
                horizontal-angle='0'
            ></lume-camera-rig> */}

            <NavTilePreviewCamera
                chunk={chunk}
                chunkWSSize={WINDOW_SIZE_TILES * nm.config.tileSize}
            />

        </lume-scene>
    </div>

// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => Comp(), domroot);