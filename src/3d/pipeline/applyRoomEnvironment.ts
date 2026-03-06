import { Scene } from "lume";
import { onMount, onCleanup } from 'solid-js';
import * as THREE from 'three'
import { RoomEnvironment } from "three/examples/jsm/Addons.js";

export default function applyRoomEnvironment(getScene: () => Scene) {

    let pmremGenerator: THREE.PMREMGenerator | undefined;
    let envRT: THREE.WebGLRenderTarget<THREE.Texture> | undefined;

    const room = new RoomEnvironment();

    // Weird defer thing we have to do to wait for the scene to actually mount.
    // Same issue as dgRender.
    onMount(() => requestAnimationFrame(() => {
        let scene = getScene();
        if (!scene) throw new Error("Unable to get scene for room env!");

        const threeScene = scene.three;
        const renderer = scene.glRenderer as THREE.WebGLRenderer
        if (!renderer) {
            throw new Error("Scene WebGL Rendering Not Yet Attached! Unable to Apply Room Env.");
        }

        if (!threeScene) {
            throw new Error("Scene THREE Entry Not Attached! Unable to apply room enviornment.");
            return;
        }

        pmremGenerator = new THREE.PMREMGenerator(renderer);
        envRT = pmremGenerator.fromScene(room);

        threeScene.environment = envRT.texture;
    }));


    onCleanup(() => {
        envRT?.dispose();
        room.dispose();
        pmremGenerator?.dispose();
    })
}