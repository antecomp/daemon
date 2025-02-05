import mapobj from './models/map.obj?url'
import mapmtl from './models/map.mtl?url'
import player_ref from '../shared_models/player_ref.fbx?url'
//import WadsCam from '../../components/util/wadscam'
import HeadCam from '@/components/util/HeadCam'
import { createSignal, onMount } from 'solid-js'
import Interactable from '@/components/util/Interactable'
import { Scene } from 'lume'
import applyShader from '@/util/applyShader'
import WadsCam from '@/components/util/wadscam'

export default function AnotherScene() {
    let sceneRef: Scene | undefined;

    const [camLayout, setCamLayout] = createSignal({
        position: "35 -192 144",
        orientation: {
            yaw: 18,
            pitch: 0
        }
    })

    const [humanYaw, setHumanYaw] = createSignal(0);

    // setTimeout(() => {
    //     setCamLayout({
    //         position: "0, -128, -10",
    //         orientation: {
    //             yaw: 160,
    //             pitch: 10
    //         }
    //     })
    // }, 5000)

    onMount(() => {
        if (sceneRef) {
            // Unfortunately, due to how Solid mounts, it triggers
            // this call before the scenes openGlRenderer is setup
            // We have to do this arbitrary delay to force a wait.
            requestAnimationFrame(() => {
                applyShader(sceneRef);
            });
        }
    })

    return(
        <lume-scene 
            webgl
            ref={sceneRef} 
            shadow-mode="basic" 
            id='SCENE'
            physically-correct-lights 
            perspective="800"
            fog-mode="linear" 
            fog-color="#000000" 
            fog-near="100" 
            fog-far="750"
        >

			<HeadCam
				baseOrientation={camLayout().orientation}
				position={camLayout().position}
				maxYaw={70}
				maxPitch={15}
			/>

            {/* <WadsCam></WadsCam> */}

            <lume-point-light 
                intensity="1200" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="-300 -550 -300" 
                color="white"
            >
                <lume-sphere size="20" 
                    cast-shadow="true" 
                    receive-shadow="false" 
                    color="#ff006e" 
                    //@ts-ignore
                    has="basic-material"
                ></lume-sphere>
            </lume-point-light>

            <lume-sphere
                size="20"
                cast-shadow="true"
                receive-shadow="false"
                color="white"
                //@ts-ignore
                has="basic-material"
                mount-point="0.5 0.5"
                align-point="0.5 0.5"
            ></lume-sphere>

            <Interactable onClick={() => alert("Sphere Clicked")}>
                <lume-sphere
                    size="20"
                    cast-shadow="true"
                    receive-shadow="false"
                    color="green"
                    //@ts-ignore
                    has="basic-material"
                    mount-point="0.5 0.5"
                    align-point="0.5 0.5"
                    position="0 0 -248"
                ></lume-sphere>
            </Interactable>

        <Interactable 
            onClick={() => setHumanYaw(prev => prev +5)} 
            /* onHover={() => console.log(playerRef!)} // This works but obv TS has no way of knowing lume exposes a var by this name from id. */
        >
            <lume-fbx-model
                id="playerRef"
                src={player_ref}
                rotation={`0 ${humanYaw()} 0`}
            ></lume-fbx-model>
        </Interactable>

          <lume-ambient-light intensity={5} />
            <lume-obj-model 
                id="map" 
                obj={mapobj}
                mtl={mapmtl}
                color="white"
                recieve-shadow="true"
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
                //position="-175 -100 0"
            ></lume-obj-model>
            
        </lume-scene>
    )
}