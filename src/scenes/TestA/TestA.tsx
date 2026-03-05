import PlayerCam from "@/3d/camera/PlayerCam";
import { useDGShader } from "@/3d/pipeline/dgRender";
import createTileNavigator from "@/3d/tilenav/createTileNavigator";
import { Scene } from "lume";
import { NavCoord, NavMap } from "@/3d/tilenav/tilenav.types";

import friend_texture from '@/assets/artwork/characters/friend.png';
import Billboard from "@/3d/components/Billboard";
import { addLogMessage } from "@/app/shell/hud/EventLog";
import tada_sound from './assets/tada.mp3';
import { playSoundOnce } from "@/shared/utils/playSound";
import Clouds from "@/shared/components/Clouds/Clouds";
import NavCompass from "@/3d/tilenav/NavCompass";
import { startBattle } from "@/features/battle/startBattle";

import { OPPONENT_BNUY } from "@/data/battles/bnuy";

import {createSignal} from 'solid-js';

import world from './assets/world1.glb';
import NM from './assets/NM.json';
import AtTile from "@/3d/tilenav/AtTile";
import attachToConsole from "@/devtools/attachToConsole";

export default function TestA() {
    const { cameraControlSignals, navController } = createTileNavigator(NM as NavMap);
    let sceneRef!: Scene;
    useDGShader(() => sceneRef);

    const [rabbitTile, setRabbitTile] = createSignal<NavCoord>('-5,-5');
    attachToConsole(setRabbitTile, 'TEST_SETRT');

    return (<>
        <NavCompass nc={navController} nm={navController.navMap}></NavCompass>
        <lume-scene
            ref={sceneRef}
            webgl
            shadow-mode="basic"
            id='SCENE'
            physically-correct-lights
            perspective="800"
        >
            <PlayerCam
                sceneRef={sceneRef}
                {...cameraControlSignals()}
                interactionDistance={50} // larger than default provided by tilenav
            />

            <lume-ambient-light intensity={4} />

            <lume-gltf-model
                align-point="0.5 0.5"
                scale="10 10 10"
                src={world}
            />

        <AtTile
            pos={rabbitTile()}
            nm={navController.navMap}
            nc={navController}
        >
                <Billboard
                    texture={friend_texture}
                    scale={7.5}
                    //position="0 -14 -120"
                    position="0 -3 0"
                    interactions={[
                        () => { addLogMessage('You pet the rabbit.'); playSoundOnce(tada_sound) },
                        () => startBattle(OPPONENT_BNUY),
                        () => addLogMessage('You stare at the rabbit.')
                    ]}
                />
                </AtTile>

            <Clouds
                size="1000 1000 1"
                position="0 -150 0"
                initialTime={2894}
            />

        </lume-scene>
    </>)
}