import { Scene } from "lume";
import { onMount } from "solid-js";
// import PlayerCam from "@/components/lume/playerCam/PlayerCam";
import { useDGShader } from "@/3d/pipeline/dgRender";
//import Freecam from "@/3d/camera/Freecam";
import PlayerCam from '@/3d/camera/PlayerCam';
//import NavigationPlane from '@/3d/components/navigation/NavigationPlane';

import world from '@/scenes/Bridge/assets/bridge_a_bake.glb';
import NM from './assets/NM.json';
import createTileNavigator from '@/3d/tilenav/createTileNavigator';
import { NavMap } from '@/3d/tilenav/tilenav.types';
import NavCompass from '@/3d/tilenav/NavCompass';
import spawnPopup from '@/app/shell/popup/Popup';
import controls_dia from '../../assets/misc/controls dia.png';


export default function Bridge() {
    let sceneRef!: Scene;

    onMount(() => useDGShader(() => sceneRef));


    const {cameraControlSignals, navController} = createTileNavigator(NM as NavMap);

    onMount(() => {
        spawnPopup((<div style={{'padding': '20px', 'display': 'flex', 'gap': '10px', 'width': '450px', 'justify-content': 'center', 'align-items': 'center'}}>
            <img src={controls_dia}/>
            <p style={{'transform': 'perspective(0px)'}}>Cardinal Controls Now Available.</p>
        </div>), undefined, "NOTE")
    })

    return (
        <>
        <NavCompass nc={navController} nm={NM as NavMap}/>
            <lume-scene
                webgl
                ref={sceneRef}
                shadow-mode="pcf"
                id='SCENE'
                physically-correct-lights
                perspective="800"
                shadowmap-type="pcfsoft"
                fog-mode="linear" fog-color="#000000" fog-near="600" fog-far="1200"
            >
                <PlayerCam {...cameraControlSignals()} sceneRef={sceneRef}/>
                {/* <Freecam sceneRef={sceneRef!} /> */}
                <lume-ambient-light intensity={3} />
                <lume-gltf-model
                    align-point="0.5 0.5"
                    scale="10 10 10"
                    src={world}
                />
            </lume-scene>
        </>
    )
}
