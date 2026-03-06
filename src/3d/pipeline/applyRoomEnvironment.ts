import { onCleanup, Scene } from "lume";
import * as THREE from 'three'
import { RoomEnvironment } from "three/examples/jsm/Addons.js";

export default function applyRoomEnvironment(scene: Scene) {
    const threeScene = scene.three;
    const renderer = scene.glRenderer as THREE.WebGLRenderer
    if (!renderer) {
        console.error("AAAAAA");
        return;
    }

    if (!threeScene) {
        console.error("BBBBB");
        return;
    }

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envRT = pmremGenerator.fromScene(room);

    threeScene.environment = envRT.texture;

    onCleanup(() => {
        envRT.dispose();
        room.dispose();
        pmremGenerator.dispose();
    })
}