import Interactable from "@/components/lume/Interactable";
// import Freecam from "@/components/lume/playerCam/Freecam";
import PlayerCam from "@/components/lume/playerCam/PlayerCam";
import applyDGShader from "@/core/lume/dgRender";
import lerp from "@/utils/lerp";
import sleep from "@/utils/sleep";
import { addLogMessage } from "@/views/main/ui/EventLog";
import { useSceneMenu } from "@/views/main/ui/SceneMenu/SceneMenuContext";
import { Scene } from "lume"
import { createSignal, onMount } from "solid-js"
import { Vector2 } from "three";

export default function Elevator() {
    let sceneRef!: Scene

    const {spawnMenu} = useSceneMenu();

    onMount(() => {
        requestAnimationFrame(() => applyDGShader(sceneRef))
    })

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
                            sleep(3000).then(() => setIsDoorOpen(true))
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
            {/* <lume-camera-rig align-point="0.5 0.5" distance="100"></lume-camera-rig> */}
            {/* <Freecam sceneRef={sceneRef}/> */}
            <PlayerCam
                basePos={[-60, -15, 0]}
                baseOri={{ yaw: -87, pitch: 3 }}
                maxYaw={15}
                maxPitch={6}
                animate={false}
                sceneRef={sceneRef!}
            />


            <lume-point-light intensity="4000" align-point="0.5 0.5" position="25 -10 0" color="#ffffff">
                {/* @ts-ignore */}
                <lume-sphere size="5" align-point="0.5 0.5" mount-point="0.5 0.5" cast-shadow="false" receive-shadow="false" color="#ffffff" has="basic-material"></lume-sphere>
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
                    callElevator,
                    () => addLogMessage("I shouldn't be talking to elevators."),
                    () => addLogMessage("It's an elevator, this goes to up to the skybar.")
                ]}
                showHoverBorder={!isElevatorCalled()}
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
        </lume-scene>
    )
}