import { ObjModel, Scene } from "lume";
import { onMount, createSignal, Show, } from "solid-js"
import { addLogMessage } from "@/app/shell/hud/EventLog";
import applyShadows from "@/3d/pipeline/applyShadows";
import Billboard from "@/3d/components/Billboard";
import { useDGShader } from '@/3d/pipeline/dgRender';
import { createMusicTrack } from '@/core/audio/createMusicTrack';
import { MusicManager } from '@/core/audio/musicManager';
import red from '@/assets/placeholders/red.png';

import starfield from "@/assets/3d/textures/starfield.png"
import viyaTexture from "@/assets/artwork/characters/viya.png"
import friendTexture from "@/assets/artwork/characters/friend.png"
import pallasTexture from "@/assets/artwork/characters/pallas.png"
import mapobj from './models/map.obj';
import mapmtl from './models/map.mtl';

import viya_dialogue from './dialogues/viya.bny';
import rabbit_dialogue from './dialogues/porch_rabbit.bny';

import { createBattleYieldHandler } from "@/features/battle/createBattleYieldHandler";
import { OPPONENT_MIMICRY } from "@/data/battles/mimic";
import { startDialogue } from "@/core/dialogue/dialogueSession";
import pickRandom from "@/shared/utils/pickRandom";
import createCamera from "@/3d/cam/createCamera";

export default function Porch() {
    let sceneRef!: Scene;
    useDGShader(() => sceneRef);

    const [showRabbit, setShowRabbit] = createSignal(true);

    const [viyaTex, setViyaTex] = createSignal(viyaTexture);

    let mapRef: ObjModel | undefined;

    onMount(() => {
        if (mapRef) {
            applyShadows(mapRef);
        }
    });

    // const test = createMusicTrack({ src: "PWL/erokia-786215.wav" })
    // setTimeout(() => { // Will crossfade between tracks
    //     test.src = "PWL/erokia-496757.wav"
    // }, 30000);

    const c = createCamera({ pos: [-230, -317, 128], sway: { maxPitch: 30, maxYaw: 45 }, yaw: -72 });

    return (
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf"
            perspective="800"
            shadowmap-type="pcf"
        >

            <c.Camera />

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
                texture={viyaTex()}
                position="-90 -240 0"
                scale={225}
                interactions={[
                    () => addLogMessage(`She doesn't take too kindly to your prodding.`, 'red'),
                    () => {
                        const dialogueMusic = MusicManager.pushTrack({ src: 'PWL/pw_celesta_meloD.mp3' }).id

                        const ovr = c.override({ pos: [-183, -322, 34], yaw: -84, pitch: 0 });
                        ovr.commit('cut');
                        startDialogue(viya_dialogue,
                            {
                                yieldHandlers: {
                                    battle: createBattleYieldHandler(OPPONENT_MIMICRY)
                                },

                                signalHandlers: {
                                    get_question_prompt(_, runtime) {
                                        runtime.memory.set('question_prompt', pickRandom(['Go for it.', 'I\'ll try my best', 'Alright.']))
                                    }
                                }
                            }
                        ).finally(() => {
                            ovr.release();
                            MusicManager.removeTrack(dialogueMusic);
                        })
                    },
                    //() => addLogMessage(`She is smoking a cigarette.`)
                    () => setViyaTex(pallasTexture)
                ]}
            />

            <Show when={showRabbit()}>
                <Billboard
                    texture={friendTexture}
                    scale={50}
                    position="-70 -266 200"
                    onHover={(uv, mouse) => console.log('rabbit hover: ' + uv.toArray() + mouse.toArray())}
                    onHoverLeave={() => console.log('rabbit hover end')}
                    interactions={[
                        //() => addLogMessage(`Best not to pet the rabbit. He is in a precarious spot.`),
                        () => addLogMessage('You pet the rabbit.'),
                        () => {
                            startDialogue(rabbit_dialogue, {
                                initialOverlay: red,
                                signalHandlers: {
                                    rabbit_depart() { setShowRabbit(false) }
                                }
                            })
                        },
                        //() => addLogMessage(`WARNING: CLASS 4B ENTITY. CEASE OBSERVATION IMMEDIATELY.`, 'yellow')
                        (uv, mouse) => addLogMessage(`Clicked at ${mouse.toArray().toString()}. For the rabbit this is ${uv.toArray()}`)
                    ]}
                />
            </Show>
            <lume-obj-model
                id="map"
                obj={mapobj}
                mtl={mapmtl}
                ref={mapRef}
                cast-shadow="true"
                align-point="0.5 0.5"
                mount-point="0.5 0.5"
            />

        </lume-scene>
    )
}
