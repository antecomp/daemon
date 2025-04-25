import baseobj from './models/base.obj'
import basemtl from './models/base.mtl'
import dmnobj from './models/diamond.obj'
import dmnmtl from './models/diamond.mtl'
import { ObjModel, Scene } from "lume";
import { onMount } from "solid-js";
import applyShadows from '@/core/lume/applyShadows';
import Interactable from '@/components/lume/Interactable';
import applyDGShader from '@/core/lume/dgRender';
import PlayerCam from '@/components/lume/playerCam/PlayerCam';
import NavigationPlane from '@/components/lume/NavigationPlane';
import createCameraController from '@/components/lume/playerCam/createCameraController';
import sleep from '@/utils/sleep';
import { useSceneMenu } from '@/views/main/ui/SceneMenu/SceneMenuContext';
// import WadsCam from '@/components/lume/wadscam';

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

            {/* <WadsCam
                defaultPosition='20 -600 20'
            /> */}

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
                //onHover={() => console.log("Diamond Hovered")}
                // onClick={(uv, mouse) => {
                //     console.log("diamond click:", uv, mouse);
                //     cameraController.setOverrides(
                //         [200, -712, 350],
                //         { pitch: 20, yaw: 30 },
                //         true
                //     )
                //     sleep(2000).then(() => cameraController.clearOverrides())
                // }}
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

            <NavigationPlane
                {...{cameraController}}
                planePosition={[-250, -500, 0]}
                newPos={[-217, -512, 0]}
                newOri={{yaw: -109, pitch: -8}}
                planeSize={[450, 100]}
                anim={true}
                // show={true}
                planeRotation={{pitch: 0, yaw: 0}}
            />

            <NavigationPlane
                {...{cameraController}}
                planePosition={[250, -500, 0]}
                newPos={[217, -512, 0]}
                newOri={{yaw: 109, pitch: -8}}
                planeSize={[450, 100]}
                anim={true}
                // show={true}
                planeRotation={{pitch: 0, yaw: 0}}
            />

            <NavigationPlane
                {...{cameraController}}
                planePosition={[0, -512, 350]}
                planeRotation={{pitch: 0, yaw: -90}}
                // show={true}
                anim={false}
                planeSize={200}
                newPos={[0, -512, 350]}
                newOri={{yaw: 0, pitch: 0}}
                sidedness='double'
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