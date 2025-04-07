import mapobj from './models/map.obj';
import mapmtl from './models/map.mtl';
import { ObjModel, Scene } from "lume";
import {onMount, createSignal, Show} from "solid-js"
import applyShader from "@/core/lume/applyShader";
import starfield from "../shared_textures/starfield.png"
import viyaTexture from "@/assets/artwork/characters/viya.png"
import friendTexture from "@/assets/artwork/characters/friend.png"
import { addLogMessage } from "@/views/main/ui/EventLog";
import { DialogueService } from "@/core/dialogue/dialogueService";
import root from "@/data/dialogues/rabbits/porchRabbit";
import {default as viya_root} from "./dialogues/viya_dialogue"
import applyShadows from "@/core/lume/applyShadows";
import Multicam from "@/components/lume/multicam/Multicam";
import { playerCam } from "@/components/lume/multicam/behaviors/playercam";
import Billboard from "@/components/lume/Billboard";

export const [showRabbit, setShowRabbit] = createSignal(true);

export default function Porch() {
    let sceneRef: Scene | undefined;

    let mapRef: ObjModel | undefined;

    onMount(() => {
        if(sceneRef) {
            requestAnimationFrame(() => {
                applyShader(sceneRef, 2, 0.12);
            });
        }
        if(mapRef) {
            applyShadows(mapRef);
        }
    })

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf" 
            perspective="800"
            shadowmap-type="pcf"
        >

            <Multicam
                initialBehavior={playerCam("-230 -317 128", 45, 25, 290, 0)}
            />

             {/* <WadsCam 
                defaultPosition="-230 -317 128"
            />  */}

            <lume-ambient-light intensity={4} />

            <lume-point-light 
                intensity="6000" 
                align-point="0.5 0.5" 
                mount-point="0.5 0.5" 
                position="100 -356 200" 
                color="white"
                cast-shadow="true"
            />

            <lume-point-light 
                intensity="6000" 
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
                    () => DialogueService.startDialogue(
                        viya_root, 
                        {
                            // overlay: viya_dia_bg, 
                            canCloseDialogueEarly: true,
                            cameraHijack: {
                                targetPosition: "122 -317 151",
                                targetOrientation: {yaw: 41, pitch: 2},
                                lerp: false,
                                lerpBack: true,
                                lerpSpeed: 0.06
                            }
                        }
                    ),
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
                            () => DialogueService.startDialogue(root),
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