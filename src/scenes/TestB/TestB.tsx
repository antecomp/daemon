import { useDGShader } from "@/3d/pipeline/dgRender";
import { Scene } from "lume";
import { NavMap } from "@/3d/tilenav/tilenav.types";

import Clouds from "@/shared/components/Clouds/Clouds";

import world from './assets/world1.glb';
import NM from './assets/NM.json';
import applyRoomEnvironment from "@/3d/pipeline/applyRoomEnvironment";
import { NavProvider } from "@/3d/nav/navContext";
import createNavState from "@/3d/nav/createNavState";
import createNavCamera from "@/3d/nav/createNavCamera";
import { DGDEV } from "@/devtools/dev";

export default function TestB() {
    const nav = createNavState(NM as NavMap);
    const cam = createNavCamera(nav, { maxYaw: 20, maxPitch: 20 });
    let sceneRef!: Scene;
    useDGShader(() => sceneRef);
    applyRoomEnvironment(() => sceneRef);

    DGDEV.attach(nav, 'tnav');

    return (
        <NavProvider nav={nav}>
            <lume-scene
                ref={sceneRef}
                webgl
                shadow-mode="basic"
                id='SCENE'
                physically-correct-lights
                perspective="800"
            >
                <cam.Camera/>

                <lume-gltf-model
                    align-point="0.5 0.5"
                    scale="10 10 10"
                    src={world}
                />

                <Clouds
                    size="1000 1000 1"
                    position="0 -150 0"
                    initialTime={2894}
                />

            </lume-scene>
        </NavProvider>
    )
}