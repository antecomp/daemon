import lerp from "@/utils/lerp";
import { Scene } from "lume"
import { createSignal } from "solid-js"

export default function Elevator() {
    let sceneRef!: Scene

    const [isDoorOpen, setIsDoorOpen] = createSignal(false);

    setTimeout(() => {setIsDoorOpen(true)}, 2000);

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf"
            perspective="800"
            shadowmap-type="pcf"
        >
            <lume-camera-rig align-point="0.5 0.5" distance="100"></lume-camera-rig>

            <lume-point-light intensity="200" align-point="0.5 0.5" position="25 -10 0" color="#ffffffff">
                {/* @ts-ignore */}
                <lume-sphere size="5" align-point="0.5 0.5" mount-point="0.5 0.5" cast-shadow="false" receive-shadow="false" color="#ffffffff" has="basic-material"></lume-sphere>
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
                    0, -25, isDoorOpen() ? lerp(z, 9, 2 * dt/1000) : 0
                ]}

                size="5 25 25"
                color="orange"

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
                    0, -25, isDoorOpen() ? lerp(z, -34, 2 * dt/1000) : -25
                ]}

                size="5 25 25"
                color="red"

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
                color="green"
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
                color="blue"
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
                color="yellow"
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
        </lume-scene>
    )
}