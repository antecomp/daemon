import mapobj from './models/map.obj';
import mapmtl from './models/map.mtl';
import { ObjModel, Scene } from "lume";
import {onMount, createSignal, Show,} from "solid-js"
import starfield from "../shared_textures/starfield.png"
import viyaTexture from "@/assets/artwork/characters/viya.png"
import friendTexture from "@/assets/artwork/characters/friend.png"
import { addLogMessage } from "@/views/main/ui/EventLog";
import { DialogueService } from "@/core/dialogue/dialogueService";
import rabbit_root from "@/scenes/Porch/dialogues/porchRabbit";
import {default as viya_root} from "./dialogues/viya_dialogue"
import applyShadows from "@/core/lume/applyShadows";
import Billboard from "@/components/lume/Billboard";
import applyDGShader from '@/core/lume/dgRender';
import NewCam from '@/components/lume/Newcam';
import { createOverrideStore } from '@/components/lume/camOverrideUtil';

export default function Porch() {
    let sceneRef: Scene | undefined;

    const [showRabbit, setShowRabbit] = createSignal(true);
    const {overrideOri, overridePos, setOverrides, clearOverrides, anim} = createOverrideStore();
    (window as any).PRCH_setOverrides = setOverrides;
    (window as any).PRCH_clearOverrides = clearOverrides;

    let mapRef: ObjModel | undefined;

    onMount(() => {
        if(sceneRef) {
            requestAnimationFrame(() => {
                applyDGShader(sceneRef);
            });
        }
        if(mapRef) {
            applyShadows(mapRef);
        }
    });

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf" 
            perspective="800"
            shadowmap-type="pcf"
        >

            <NewCam
                basePos={[-230, -317, 128]}
                baseOri={{yaw: -72, pitch: 0}}
                maxYaw={45}
                maxPitch={30}
                sceneRef={sceneRef!}
                overrideOri={overrideOri()}
                overridePos={overridePos()}
                animate={anim()}
            />

            <lume-ambient-light intensity={4} />

            <lume-point-light 
                intensity="5500" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -356 200" 
                color="white"
                cast-shadow="true"
            />

            <lume-point-light 
                intensity="5500" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -356 0" 
                color="white"
                cast-shadow="true"
            />

            <lume-sphere
                id="stars"
                texture={starfield}
                receive-shadow="false"
                //@ts-ignore
                has="basic-material"
                sidedness="back"
                size="6000 6000 6000"
                mount-point="0.5 0.5 0.5"
                color="white"
            />

            <Billboard
                texture={viyaTexture}
                position="-90 -240 0"
                scale={225}
                interactions={[
                    () => addLogMessage(`She doesn't take too kindly to your prodding.`, 'red'),
                    () => {

                        DialogueService.startDialogue(
                            viya_root, 
                            {
                                canCloseDialogueEarly: true,
                            }
                        );
                    },
                    () => addLogMessage(`She is smoking a cigarette.`)
            ]}
            />

            <Show when={showRabbit()}>
                <Billboard
                        texture={friendTexture}
                        scale={50}
                        position="-70 -266 200"
                        interactions={[
                            () => addLogMessage(`Best not to pet the rabbit. He is in a precarious spot.`),
                            //() => addLogMessage(`The rabbit doesn't seem enthused by your conversational efforts.`),
                            () => {
                                DialogueService.startDialogue(rabbit_root, {ctx: {setShowRabbit}}).then(
                                    () => console.log("Rabbit dialogue complete")
                                )
                            },
                            //() => addLogMessage(`WARNING: CLASS 4B ENTITY. CEASE OBSERVATION IMMEDIATELY.`, 'yellow')
                            (_uv, mouse) => addLogMessage(`Clicked at ${mouse.toArray().toString()}`)
                        ]}
                />
            </Show>
            <lume-obj-model
                id="map"
                obj={mapobj}
                mtl={mapmtl}
                ref={mapRef}
                recieve-shadow="true"
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
            />

        </lume-scene>
    )
}