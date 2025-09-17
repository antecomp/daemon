import baseobj from './models/base.obj'
import basemtl from './models/base.mtl'
import dmnobj from './models/diamond.obj'
import dmnmtl from './models/diamond.mtl'
import { ObjModel, Scene } from "lume";
import { onMount } from "solid-js";
import applyShadows from '@/3d/pipeline/applyShadows';
import Interactable from '@/3d/components/Interactable';
import applyDGShader from '@/3d/pipeline/dgRender';
import PlayerCam from '@/3d/camera/PlayerCam';
import createCameraController from '@/3d/camera/createCameraController';
import sleep from '@/shared/utils/sleep';
import { useSceneMenu } from '@/app/shell/scene-menu/SceneMenuContext';
import { createMusicTrack } from '@/core/audio/createMusicTrack';
import NavigationGraph from '@/3d/components/navigation/NavigationGraph';

export default function Liminality() {
    let sceneRef: Scene | undefined;
    let baseRef: ObjModel | undefined;
    let dmnRef: ObjModel | undefined;

    const lightIntensity = "300";

    const {spawnMenu} = useSceneMenu()!;

    const { cameraControlSignals, cameraController } = createCameraController(
        [0, -512, 350],
        { pitch: 0, yaw: 0 },
        { maxPitch: 20, maxYaw: 20 },
    )

    onMount(() => {
        requestAnimationFrame(() => {
            // sceneRef && applyShader(sceneRef, 0);
            sceneRef && applyDGShader(sceneRef);
            baseRef && applyShadows(baseRef);
            dmnRef && applyShadows(dmnRef);
        });
    })

    createMusicTrack({src: "PWL/loop_a.wav"})

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

            <PlayerCam
                {...cameraControlSignals()}
                sceneRef={sceneRef!}
            />

            <lume-obj-model
                id="base"
                ref={baseRef}
                obj={baseobj}
                mtl={basemtl}
                recieve-shadow="true"
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
                                    cameraController.setOverrides(
                                        [200, -712, 350],
                                        { pitch: 20, yaw: 30 },
                                        true
                                    )
                                    sleep(2000).then(() => cameraController.clearOverrides())
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
                    recieve-shadow="true"
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

            <NavigationGraph
                initial="init"
                cameraController={cameraController}
                graph={{
                    init: {
                        planePosition:[0, -512, 350],
                        planeRotation:{pitch: 0, yaw: -90},
                        // show:true,
                        anim:true,
                        show: true,
                        planeSize:200,
                        newPos:[0, -512, 350],
                        newOri:{yaw: 0, pitch: 0},
                        sidedness:'double',
                        connected: ["l", "r"]
                    },
                    l: {
                        planePosition:[250, -500, 0],
                        newPos:[217, -512, 0],
                        newOri:{yaw: 109, pitch: -8},
                        planeSize:[450, 100],
                        anim:true,
                        show:true,
                        planeRotation:{pitch: 0, yaw: 0},
                        connected: ["init", "r"] // try commenting this out to verify init not shown (deadend)
                    },
                    r: {
                        planePosition:[-250, -500, 0],
                        newPos:[-217, -512, 0],
                        newOri:{yaw: -109, pitch: -8},
                        planeSize:[450, 100],
                        anim:true,
                        show:true,
                        planeRotation:{pitch: 0, yaw: 0},
                        connected: []
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