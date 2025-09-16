import mapobj from './models/map.obj?url'
import mapmtl from './models/map.mtl?url'
import player_ref from '../shared_models/player_ref.fbx?url'
import { createSignal, onMount } from 'solid-js'
import Interactable from '@/3d/components/Interactable'
import { Scene } from 'lume'
import applyDGShader from '@/3d/pipeline/dgRender'
import { InteractionMode } from '@/core/interaction/interactable.types'
import PlayerCam from '@/3d/camera/PlayerCam'

export default function AnotherScene() {
    let sceneRef: Scene | undefined;

    const [humanYaw, setHumanYaw] = createSignal(0);

    onMount(() => {
        if (sceneRef) {
            // Unfortunately, due to how Solid mounts, it triggers
            // this call before the scenes openGlRenderer is setup
            // We have to do this arbitrary delay to force a wait.
            requestAnimationFrame(() => {
                applyDGShader(sceneRef);
            });
        }
    });

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

            <PlayerCam basePos={[35, -192, 144]} baseOri={{pitch: 0, yaw: 18}} sceneRef={sceneRef!} maxPitch={20} maxYaw={80}/>

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

            <Interactable
                interactions={[() => console.log('interact'), () => console.log('chat'), () => console.log('observe')]}    
            >
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
            interactions={{
                [InteractionMode.Interact]: () => {alert('test guy INTERACT')},
                [InteractionMode.Chat]: () => alert('test guy CHAT'),
                [InteractionMode.Observe]: () => {alert('test guy OBSERVE')}
            }}
        >
            <lume-fbx-model
                id="playerRef"
                src={player_ref}
                rotation={`0 ${humanYaw()} 0`}
            ></lume-fbx-model>
        </Interactable>

          <lume-ambient-light intensity={3} />
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