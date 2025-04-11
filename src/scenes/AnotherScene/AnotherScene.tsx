import mapobj from './models/map.obj?url'
import mapmtl from './models/map.mtl?url'
import player_ref from '../shared_models/player_ref.fbx?url'
import { createSignal, Match, onMount, Switch } from 'solid-js'
import Interactable from '@/components/lume/Interactable'
import { Scene } from 'lume'
import applyDGShader from '@/core/lume/dgRender'
import Multicam from '@/components/lume/multicam/Multicam'
import { playerCam } from '@/components/lume/multicam/behaviors/playercam'
import { InteractionMode } from '@/core/interaction/interactable.types'

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

    const [loc, setLoc] = createSignal(0);

    setTimeout(() => setLoc(1), 5000)

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

            <Switch>
                <Match when={loc() == 0}>
                    <Multicam initialBehavior={playerCam("35 -192 144", 80, 20, 18, 0)}/>
                </Match>
                <Match when={loc() == 1}>
                    <Multicam initialBehavior={playerCam("35 -192 144", 80, 20, 180, 5)}/>
                </Match>
            </Switch>

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