import { useDGShader } from "@/3d/pipeline/dgRender";
import { GltfModel, Scene } from "lume";

import islands_glb from './assets/DG_ISLANDS_B3.glb?url';
import Freecam from "@/3d/camera/Freecam";

export default function Islands() {
  let islands_ref!: GltfModel;
  let sceneRef!: Scene;
  useDGShader(() => sceneRef);


  return (
    <lume-scene webgl perspective="800" ref={sceneRef}
    >
      {/* <lume-camera-rig align-point="0.5 0.5" distance="10000"></lume-camera-rig> */}


      <Freecam
        sceneRef={sceneRef}
      />


      {/* <PlayerCam
        basePos={[-1614, -159, 514]}
        baseOri={{ yaw: 281, pitch: -2 }}
        maxYaw={30}
        maxPitch={20}
        animate={false}
        sceneRef={sceneRef!}
      /> */}

      <lume-ambient-light intensity="6.75" />
      {/* <lume-directional-light intensity="2" position="0 10 0" align-point="0.5 0.5"/> */}
      <lume-gltf-model
        src={islands_glb}
        align-point='0.5 0.5'
        scale="50 50 50"
        ref={islands_ref}
      />
    </lume-scene>
  )
}
