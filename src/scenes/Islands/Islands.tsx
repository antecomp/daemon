import { useDGShader } from "@/3d/pipeline/dgRender";
import { GltfModel, Scene } from "lume";
import { Show } from 'solid-js';
import { createStore } from "solid-js/store";

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
//import test_girl_sprite from '../Test/assets/girl2.png';

import { OPPONENT_FOX } from "@/data/battles/fox";
import showBattleTutorial from "@/features/battle/tutorial/BattleTutorial";
import { DialogueService } from "@/core/dialogue/dialogueService";

import fox_dialogue_root from "./data/fox_dialogue";

import bttle_placeholder from '../../assets/placeholders/BTTLE.png';
import { OPPONENT_ASTRAVEILLAN } from "@/data/battles/astraveillan";
import { OPPONENT_PRESCIENTIA } from "@/data/battles/prescientia";
import { OPPONENT_PARALLACTIC } from "@/data/battles/parallactic";

export default function Islands() {
  let islands_ref!: GltfModel;
  let sceneRef!: Scene;
  useDGShader(() => sceneRef, 'quantized');

  const { cameraControlSignals, navController } = createTileNavigator(NM as NavMap);

  const [completedBattles, setCompletedBattles] = createStore({
    crow: false,
    fox: false,
    astra: false,
    pres: false,
    para: false
  });

  function battleToContinue(who: keyof typeof completedBattles) {
    startBattle({
      crow: OPPONENT_CROW,
      fox: OPPONENT_FOX,
      astra: OPPONENT_ASTRAVEILLAN,
      pres: OPPONENT_PRESCIENTIA,
      para: OPPONENT_PARALLACTIC
    }[who], (who == 'fox') ? showBattleTutorial : undefined).then(outcome => setCompletedBattles(who, outcome === BattleOutcome.PlayerVictory));
  }

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

        <Show when={!completedBattles.fox}>
          <AtTile
            pos='-6,-10'
            nm={navController.navMap}
            nc={navController}
            onWalkInto={() => addLogMessage('The fox is blocking your path.')}
          >
            <Billboard
              texture={fox_sprite}
              scale={60}
              position='0 -25 0'
              interactions={[
                () => addLogMessage("As you reach out, the fox snarls loudly."),
                () => {
                  DialogueService.startDialogue(fox_dialogue_root, {
                    ctx: {
                      actions: {
                        foxBattle: () => battleToContinue('fox')
                      }
                    }
                  })
                },
                () => addLogMessage("There is a strange fox blocking my path. It is staring at me intensely.")
              ]}
            />
          </AtTile>
        </Show>

        <Show when={!completedBattles.crow}>
          <AtTile
            pos='1,-8'
            nm={navController.navMap}
            nc={navController}
            onWalkInto={() => addLogMessage('There is a crow blocking your path.')}
          >
            <Billboard
              id="crow"
              texture={crow_sprite}
              scale={20}
              position='-19.5 -35 13'
              interactions={[
                () => battleToContinue('crow'),
                () => addLogMessage("The crow turns its head at the sound of your voice."),
                () => addLogMessage("There is a crow blocking your path.")
              ]}
            />
          </AtTile>
        </Show>

        <Show when={!completedBattles.pres}>
          <AtTile
            pos='1,-2'
            nm={navController.navMap}
            nc={navController}
            onWalkInto={() => battleToContinue('pres')}
          >
            <Billboard
              texture={bttle_placeholder}
              scale={30}
              position="0 -25 0"
            />
          </AtTile>
        </Show>

        <Show when={!completedBattles.astra}>
          <AtTile
            pos='1,2'
            nm={navController.navMap}
            nc={navController}
            onWalkInto={() => battleToContinue('astra')}
          >
            <Billboard
              texture={bttle_placeholder}
              scale={30}
              position="-5 -45 0"
            />
          </AtTile>
        </Show>


        <Show when={!completedBattles.para}>
          <AtTile
            pos='3,7'
            nm={navController.navMap}
            nc={navController}
            onWalkInto={() => battleToContinue('para')}
          >
            <Billboard
              texture={bttle_placeholder}
              scale={30}
              position="0 -45 -5"
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
