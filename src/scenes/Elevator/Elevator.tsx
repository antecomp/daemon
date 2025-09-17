import Interactable from "@/3d/components/Interactable";
import PlayerCam from "@/3d/camera/PlayerCam";
import { useDGShader } from "@/3d/pipeline/dgRender";
import lerp from "@/shared/utils/lerp";
import sleep from "@/shared/utils/sleep";
import { addLogMessage } from "@/app/shell/hud/EventLog";
import { useSceneMenu } from "@/app/shell/scene-menu/SceneMenuContext";
import { ObjModel, Scene } from "lume"
import { createSignal, onMount } from "solid-js"
import { Vector2 } from "three";

import elevator_cab_obj from './models/elevator_shaft.obj'
import elevator_cab_mtl from './models/elevator_shaft.mtl'
import elevator_buttons from './models/elevator_buttons.png'
import elevator_buttons_lit from './models/elevator_buttons_white.png'
import { SceneFadeManager } from "@/app/shell/scene-fade-overlay/SceneFadeOverlay";
import { setCurrentScene } from "@/app/shell/scene-container/SceneContainer";
import applyShadows from "@/3d/pipeline/applyShadows";
import { playTextOverlay } from "@/features/text-overlay/TextOverlay";

import opening_textscene from "./data/opening_textscene"

export default function Elevator() {
    let sceneRef!: Scene
    let cabRef!: ObjModel
    useDGShader(() => sceneRef)

    onMount(() => {
        cabRef && applyShadows(cabRef);
    });

    const {spawnMenu} = useSceneMenu();

    const [isDoorOpen, setIsDoorOpen] = createSignal(false);
    const [isElevatorCalled, setIsElevatorCalled] = createSignal(false);

    function callElevator(_uv: any, mouse: Vector2) {
        if(!isElevatorCalled()) {
            spawnMenu(
                "Call the elevator?",
                [
                    {
                        label: "Yes", 
                        onSelect(){
                            setIsElevatorCalled(true);
                            sleep(3000).then(() => setIsDoorOpen(true)).then(async () => {
                                await sleep(5000);
                                await SceneFadeManager.fadeSceneOut();
                                setCurrentScene("GemmaBar");
                                await playTextOverlay(opening_textscene);
                                SceneFadeManager.fadeSceneIn();
                            })
                        }
                    },
                    {label: "No"}
                ],
                mouse
            )
        }
    }

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf"
            perspective="800"
            shadowmap-type="pcf"
        >
            {/* <Freecam sceneRef={sceneRef} initialPos={[-38, -17, -38]} initialOri={{ yaw: -135, pitch: 0 }}/> */}
            
            <PlayerCam
                basePos={[-60, -15, 0]}
                baseOri={{ yaw: -90, pitch: 3 }}
                maxYaw={15}
                maxPitch={6}
                animate={false}
                sceneRef={sceneRef!}
            />
           


            <lume-point-light intensity="4000" align-point="0.5 0.5" position="25 -26 0" color="#ffffff">
                {/* @ts-ignore */}
                {/* <lume-sphere size="5" align-point="0.5 0.5" mount-point="0.5 0.5" cast-shadow="false" receive-shadow="false" color="blue" has="basic-material"></lume-sphere> */}
            </lume-point-light>
            


            {/* Door Right */}
            <lume-box
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0"

                // position="0 -25 9" // open
                // position="0 -25 0"  // close
                //@ts-expect-error
                position={(x,y,z, _t, dt) => [
                    // 0, -25, isDoorOpen() ? lerp(z, 9, 2 * dt/1000) : lerp(z, 0, 2 * dt / 1000)
                    0, -25, isDoorOpen() ? lerp(z, 9, 1 * dt/1000) : 0
                ]}

                size="5 25 25"
                color="#bbbbbb"

                has="basic-material"
            />


            {/* Door Left */}
            <lume-box
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0"

                // position="0 -25 -34" // open
                // position="0 -25 -25" // close
                //@ts-expect-error
                position={(x,y,z, _t, dt) => [
                    // 0, -25, isDoorOpen() ? lerp(z, -34, 2 * dt/1000) : lerp(z, -25, 2 * dt / 1000)
                    0, -25, isDoorOpen() ? lerp(z, -34, 1 * dt/1000) : -25
                ]}

                size="5 25 25"
                color="gray"

                has="basic-material"
            />

            {/* Wall Left */}
            <lume-plane
                cast-shadow="true"
                size="50 50 0"

                //@ts-expect-error
                has="basic-material"

                position="-2.51 -50 -34"
                rotation="0 -90 0"
                color="black"
                align-point="0.5 0.5"
                mount-point="0.5 0"
            />

            {/* Wall Right */}
            <lume-plane
                cast-shadow="true"
                size="50 50 0"

                //@ts-expect-error
                has="basic-material"

                position="-2.51 -50 34"
                rotation="0 -90 0"
                color="black"
                align-point="0.5 0.5"
                mount-point="0.5 0"
            />

            {/*  Wall top */}
            <lume-box
                cast-shadow="true"
                size="40 25 5"

                //@ts-expect-error
                has="basic-material"

                position="0 -50 -3"
                rotation="0 -90 0"
                color="gray"
                align-point="0.5 0.5"
                mount-point="0.5 0"
            />

            <lume-plane
                cast-shadow="true"
                size="50 50 0"

                //@ts-expect-error
                has="basic-material"

                position="-2.51 -75 0"
                rotation="0 -90 0"
                color="black"
                align-point="0.5 0.5"
                mount-point="0.5 0"
            />

            {/* Ground */}
            <lume-plane
                receive-shadow="true"
                //@ts-expect-error
                has="standard-material"
                // has="phong-material" // Also works.
                size="100 100 0"
                position="0 0 0"
                color="black"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                rotation="90 0 0"
                roughness="1"
            />

            <Interactable
                interactions={[
                    () => addLogMessage("I should use the buttons to call the elevator."),
                    () => addLogMessage("I shouldn't be talking to elevators."),
                    () => addLogMessage("It's an elevator, this goes to up to the skybar.")
                ]}
                // showHoverBorder={!isElevatorCalled()}
            >
                <lume-plane
                    receive-shadow="false"
                    cast-shadow="false"
                    // @ts-expect-error
                    has="basic-material"
                    size="18 25 0"
                    rotation="0 -90 0"
                    color="green"
                    opacity="0.0"
                    align-point="0.5 0.5"
                    mount-point="0.5 0"
                    position="-5 -25.5 0"
                    sidedness="double"
                />
            </Interactable>


            <lume-obj-model
                id="cab"
                ref={cabRef}
                obj={elevator_cab_obj}
                mtl={elevator_cab_mtl}
                recieve-shadow="true"
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="1 1"
                position="16.25 -12.5 0"
                scale="15 15 25"
                rotation="0 90 0"
            />

            <Interactable
                interactions={[
                    callElevator,
                    () => addLogMessage("I should press the button, not talk to it."),
                    () => addLogMessage("These are buttons to call the elevator.")
                ]}
                showHoverBorder={!isElevatorCalled()}
            >
            <lume-plane
                id="buttons"
                texture={isElevatorCalled() ? elevator_buttons_lit : elevator_buttons}
                receive-shadow="false"
                sidedness="double"
                size="2.048 3.808 1"
                rotation="0 90 0"
                position="-5 -16 -12"
                align-point="0.5 0.5"
                alpha-test="0.1"

                //@ts-expect-error
                has="basic-material"
            />
            </Interactable>
        </lume-scene>
    )
}