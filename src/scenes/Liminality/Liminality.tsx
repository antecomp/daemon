import baseobj from './models/base.obj'
import basemtl from './models/base.mtl'
import dmnobj from './models/diamond.obj'
import dmnmtl from './models/diamond.mtl'
import { ObjModel, Scene } from "lume";
import { onMount } from "solid-js";
import applyShadows from '@/3d/pipeline/applyShadows';
import Interactable from '@/3d/components/Interactable';
import applyDGShader from '@/3d/pipeline/dgRender';
import sleep from '@/shared/utils/sleep';
import { useSceneMenu } from '@/app/shell/scene-menu/SceneMenuContext';
import { createMusicTrack } from '@/core/audio/createMusicTrack';
import createCamera from '@/3d/cam/createCamera';
import NavGraph from '@/3d/components/navigation/NavGraph';

export default function Liminality() {
    let sceneRef: Scene | undefined;
    let baseRef: ObjModel | undefined;
    let dmnRef: ObjModel | undefined;

    const lightIntensity = "300";

    const { spawnMenu } = useSceneMenu()!;

    const cam = createCamera({
        pos: [0, -512, 350],
        pitch: 0, yaw: 0,
        sway: { maxPitch: 20, maxYaw: 20 }
    })

    onMount(() => {
        requestAnimationFrame(() => {
            // sceneRef && applyShader(sceneRef, 0);
            sceneRef && applyDGShader(sceneRef);
            baseRef && applyShadows(baseRef);
            dmnRef && applyShadows(dmnRef);
        });
    });

    createMusicTrack({ src: "PWL/loop_a.wav" })

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf"
            perspective="800"
            physically-correct-lights
            fog-mode="linear" fog-color="#000000" fog-near="500" fog-far="900"
            shadowmap-type="pcf"
        >
            <lume-ambient-light intensity={0.0} />

            <cam.Camera />

            <lume-obj-model
                id="base"
                ref={baseRef}
                obj={baseobj}
                mtl={basemtl}
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                scale="50 50 50"
            />

            <Interactable
                interactions={[(_uv, mouse) => {
                    spawnMenu(
                        `Approach The Reliquary?`,
                        [
                            {
                                label: "Yes",
                                onSelect: () => {
                                    const { commit, release } = cam.override({
                                        pos: [200, -712, 350],
                                        pitch: 20, yaw: 30,
                                    });
                                    commit('ease');
                                    sleep(2000).then(() => release('ease'));
                                }
                            },
                            {
                                label: "Nah",
                                // implicit just close.
                            }
                        ]
                        , mouse, 150)
                }]}
            >
                <lume-obj-model
                    id="dmn"
                    ref={dmnRef}
                    obj={dmnobj}
                    mtl={dmnmtl}
                    cast-shadow="true"
                    align-point="0.5 0.5"
                    mount-point="0.5 0.5"
                    scale="50 50 50"
                    //@ts-ignore
                    position={(x: number, y: number, z: number, t: number) => [x, 8 * Math.sin(t / 1000), z]}
                    //@ts-ignore
                    rotation={(x: number, y: number) => [x, y + 0.5]}
                />
            </Interactable>

            <NavGraph
                initial="init"
                cam={cam}
                graph={{
                    init: {
                        pos: [0, -512, 350],
                        ori: { pitch: 0, yaw: -90 },
                        show: true,
                        size: 200,
                        goto: {pos: [0, -512, 350], yaw: 0, pitch: 0},
                        sidedness: 'double',
                        connected: ["l", "r"]
                    },
                    l: {
                        pos: [250, -500, 0],
                        goto: {pos: [217, -512, 0], yaw: 109, pitch: -8},
                        size: [450, 100],
                        show: true,
                        ori: { pitch: 0, yaw: 0 },
                        connected: ["init"] // try commenting this out to verify init not shown (deadend)
                    },
                    r: {
                        pos: [-250, -500, 0],
                        goto: {pos: [-217, -512, 0], yaw: -109, pitch: -8},
                        trans: 'cut',
                        size: [450, 100],
                        show: true,
                        ori: { pitch: 0, yaw: 0 },
                        connected: ['init']
                    }
                }}
            />

            <lume-point-light
                intensity={lightIntensity}
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                position="100 -550 100"
                color="white"
                cast-shadow="true"
            />

            <lume-point-light
                intensity={lightIntensity}
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                position="-100 -550 -100"
                color="white"
                cast-shadow="true"
            />

            <lume-point-light
                intensity={lightIntensity}
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                position="100 -550 -100"
                color="white"
                cast-shadow="true"
            />

            <lume-point-light
                intensity={lightIntensity}
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                position="-100 -550 100"
                color="white"
                cast-shadow="true"
            />

            <lume-point-light
                intensity={lightIntensity}
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                position="0 -700 0"
                color="white"
                cast-shadow="true"
            />
        </lume-scene>
    )

}