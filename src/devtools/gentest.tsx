import NavTilePreviewer from '@/3d/tile/NavTilePreviewer';
import { Direction, NavMap } from '@/3d/tile/tilenav.types';
import EnochPuzzle from '@/features/puzzles/enoch/EnochPuzzle';
import '@/shared/styles/base.css';
import { render } from "solid-js/web";

import 'lume';

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
            width: '500px',
            height: '400px'
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

            <lume-camera-rig
                align-point="0.5 0.5"
                // distance="1500"
                max-distance='Infinity'
                min-distance='0'
                initial-polar-angle='75'
                distance='2000'
                max-horizontal-angle='60'
                min-horizontal-angle='-60'
                horizontal-angle='0'
            ></lume-camera-rig>

            {/* ----------------------------------------------------------------------- */}

            <NavTilePreviewer
                NM={nm}
                hoveredTile={'-5,-5'}
                selectedTiles={[]}
                clip={false}
                chunkOffset={[0, 0]}
            />

        </lume-scene>
    </div>

// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => Comp(), domroot);