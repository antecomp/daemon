import { useDGShader } from "@/3d/pipeline/dgRender";
import { GltfModel, Scene } from "lume";

import islands_glb from './assets/malice.glb';
import createTileNavigator from "@/3d/tilenav/createTileNavigator";
import NM from './assets/NM.json'
import PlayerCam from "@/3d/camera/PlayerCam";
import NavCompass from "@/3d/tilenav/NavCompass";
import { NavMap } from "@/3d/tilenav/tilenav.types";

import test_girl_sprite from '../Test/assets/girl2.png';
import Billboard from "@/3d/components/Billboard";

export default function Islands() {
  let islands_ref!: GltfModel;
  let sceneRef!: Scene;
  useDGShader(() => sceneRef, 'quantized');

  const { cameraControlSignals, navController } = createTileNavigator(
    NM as NavMap
  );


  return (
    <>
      <NavCompass nc={navController} nm={navController.navMap} />
      <lume-scene webgl perspective="800" ref={sceneRef}
      >
        {/* <lume-camera-rig align-point="0.5 0.5" distance="10000"></lume-camera-rig> */}

        {/* <Freecam
        sceneRef={sceneRef}
      /> */}

        <PlayerCam
          sceneRef={sceneRef}
          {...cameraControlSignals()}
        />

        <lume-ambient-light intensity="6.5" />
        {/* <lume-directional-light intensity="2" position="0 10 0" align-point="0.5 0.5"/> */}
        <lume-gltf-model
          src={islands_glb}
          align-point='0.5 0.5'
          scale="10 10 10"
          ref={islands_ref}
        />

        <Billboard
          texture={test_girl_sprite}
          scale={60}
          position="-455 -12 -362"
          interactions={[
            () => navController.setNavMap('tiles', '2,1', 'occupied', prev => !prev)
          ]}
        />


      </lume-scene>
    </>
  )
}
