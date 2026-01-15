import applyDGShader from "@/3d/pipeline/dgRender";
import { ObjModel, Scene } from "lume";
import {onMount} from "solid-js";
import barobj from "./models/bar2.obj"
import barmtl from "./models/bar2.mtl"
import applyShadows from "@/3d/pipeline/applyShadows";
import starfield from "@/assets/3d/textures/starfield.png"
import PlayerCam from "@/3d/camera/PlayerCam";

import mimicry_icon from '../../assets/artwork/dæmons/mimicry_icon.png';
import serpent_icon from '../../assets/artwork/dæmons/snaek_icon.png';
import './battle-test.css';

import cr from '../../assets/ui/corners/s3/tl.png';
import CornerRect from "@/shared/ui/primitives/corner-rect/CornerRect";
import { OPPONENT_SERPENT } from "@/data/battles/serpent";
import { startBattle } from "@/features/battle/startBattle";


import bt1 from '@/assets/placeholders/battletut/tut1.png'
import bt2 from '@/assets/placeholders/battletut/tut2.png'
import bt3 from '@/assets/placeholders/battletut/tut3.png'
import bt4 from '@/assets/placeholders/battletut/tut4.png'
import bt5 from '@/assets/placeholders/battletut/tut5.png'
import bt6 from '@/assets/placeholders/battletut/tut6.png'
import sleep from "@/shared/utils/sleep";
import { createTutorialOverlay } from "@/shared/ui/extras/TutorialOverlay";
import { OPPONENT_MIMICRY } from "@/data/battles/mimic";


export default function BarScene() {
    let sceneRef!: Scene;
    let aaa!: ObjModel;
    
    onMount(() => {
        sceneRef && requestAnimationFrame(() => applyDGShader(sceneRef));
        aaa && applyShadows(aaa);
    });

    function spawnBattleTutorial() {
        startBattle(OPPONENT_SERPENT);
        sleep(3250).then(() => createTutorialOverlay([bt1, bt2, bt3, bt4, bt5, bt6]))
    }

    return (
        <>
        <CornerRect width="500px" height="111px" borderSize={1} borderType="solid white" corners={[cr, undefined, undefined, cr]} class='battle-playtest-container'>
            <div class='battle-playtest-menu'>
                <div class="battle-playtest-option" onClick={spawnBattleTutorial}>
                    <img src={serpent_icon}/>
                    Battle the Panoptesian Serpent (Tutorial)
                </div>
                <div class='battle-playtest-option' onClick={() => startBattle(OPPONENT_MIMICRY)}>
                   <img src={mimicry_icon}/> 
                    Battle the Mimicry (More Difficult)
                </div>
            </div>
        </CornerRect>
        <lume-scene
            webgl
            ref={sceneRef}
            id='SCENE'
            shadow-mode="pcf" 
            perspective="800"
            shadowmap-type="pcf"
        >

            <PlayerCam
                sceneRef={sceneRef}
                basePos={[-719, -327, 151]}
                baseOri={{yaw: 50, pitch: 0}}
                maxPitch={15}
                maxYaw={40}
            />

            <lume-ambient-light intensity={0.5}/>
            <lume-point-light position="-500 -180" intensity={1250} cast-shadow="true"/>

            <lume-obj-model
                ref={aaa}
                obj={barobj}
                mtl={barmtl}
                scale="50 50 50"
                receive-shadow="true"
                cast-shadow="true"
            />

            <lume-sphere
                id="stars"
                texture={starfield}
                receive-shadow="false"
                //@ts-ignore
                has="basic-material"
                sidedness="back"
                size="5000 5000 5000"
                mount-point="0.5 0.5 0.5"
                color="white"
            />


        </lume-scene>
        </>
    )
}