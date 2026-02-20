import { useDGShader } from "@/3d/pipeline/dgRender";
import { GltfModel, Scene } from "lume";
import { createSignal, Show } from 'solid-js';

import createTileNavigator from "@/3d/tilenav/createTileNavigator";
import NM from './assets/NEONM.json'
import PlayerCam from "@/3d/camera/PlayerCam";
import NavCompass from "@/3d/tilenav/NavCompass";
import { NavMap } from "@/3d/tilenav/tilenav.types";

import Billboard from "@/3d/components/Billboard";
import Clouds from "@/shared/components/Clouds/Clouds";
import AtTile from "@/3d/tilenav/AtTile";

import { addLogMessage } from "@/app/shell/hud/EventLog";

import { startBattle } from "@/features/battle/startBattle";
import { OPPONENT_CROW } from "@/data/battles/crow";
import { BattleOutcome } from "@/core/battle/model/battle";

import islands_glb from './assets/malice.glb';

import crow_sprite from '@/assets/artwork/dæmons/crow_sketch_world.png';
import fox_sprite from '@/assets/artwork/dæmons/fox.png';
import { DialogueService } from "@/core/dialogue/dialogueService";
import fox_dialogue from "./data/fox_dialogue";
//import test_girl_sprite from '../Test/assets/girl2.png';

import fox_voiceclip from '@/assets/sfx/misc/inordertopass.ogg';
import { playSoundOnce } from "@/shared/utils/playSound";
import { OPPONENT_FOX } from "@/data/battles/fox";
import showBattleTutorial from "@/features/battle/tutorial/BattleTutorial";

export default function Islands() {
  let islands_ref!: GltfModel;
  let sceneRef!: Scene;
  useDGShader(() => sceneRef, 'quantized');

  const { cameraControlSignals, navController } = createTileNavigator(NM as NavMap);

  //createMusicTrack({ src: "PWL/erokia-496757.wav" });

  const [defeatedCrow, setDefeatedCrow] = createSignal(false);
  const [defeatedFox, setDefeatedFox] = createSignal(false);

  let foxBattleTransitionStarted = false;

  return (
    <>
      <NavCompass nc={navController} nm={navController.navMap} />
      <lume-scene webgl perspective="800" ref={sceneRef}
      >
        <PlayerCam
          sceneRef={sceneRef}
          {...cameraControlSignals()}
        />

        <lume-ambient-light intensity="6.5" />
        <lume-gltf-model
          src={islands_glb}
          align-point='0.5 0.5'
          scale="10 10 10"
          ref={islands_ref}
        />
        <Show when={!defeatedCrow()}>
          <AtTile
            pos='1,-8'
            nm={navController.navMap}
            nc={navController}
          >
            <Billboard
              id="crow"
              texture={crow_sprite}
              scale={20}
              position='-19.5 -35 13'
              interactions={[
                () => startBattle(OPPONENT_CROW).then(outcome => setDefeatedCrow(outcome === BattleOutcome.PlayerVictory)),
                () => addLogMessage("The crow turns its head at the sound of your voice."),
                () => addLogMessage("There is a crow blocking your path.")
              ]}
            />
          </AtTile>
        </Show>

        <Show when={!defeatedFox()}>
          <AtTile
            pos='-6,-10'
            nm={navController.navMap}
            nc={navController}
          >
            <Billboard
              texture={fox_sprite}
              scale={60}
              position='0 -25 0'
              interactions={[
                () => addLogMessage("As you reach out, the fox snarls loudly."),
                () => {
                  if(foxBattleTransitionStarted) return;
                  foxBattleTransitionStarted = true;
                  playSoundOnce(fox_voiceclip).then(_ => startBattle(OPPONENT_FOX, showBattleTutorial)).then(outcome => {
                    foxBattleTransitionStarted = false;
                    if(outcome == BattleOutcome.PlayerVictory) setDefeatedFox(true);
                  });
                },
                () => addLogMessage("There is a strange fox blocking my path. It is staring at me intensly.")
              ]}
            />
          </AtTile>
        </Show>


        <Clouds
          size="10000 10000 1"
          position="0 -750 0"
        />

      </lume-scene>
    </>
  )
}
