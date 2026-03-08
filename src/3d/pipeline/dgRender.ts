import { FOV } from "@/config/3d.config";
import { SCENE_DIMENSIONS } from "@/config/ui.config";
import { Scene, toRadians } from "lume";
import { createSignal, onMount } from "solid-js"
import { EffectComposer, OutlinePass, OutputPass, RenderPass, ShaderPass } from "three/examples/jsm/Addons.js";
import pp_fragshader from "@/3d/shaders/post-processing/dg.frag.glsl"
import pp_vertshader from "@/3d/shaders/post-processing/pass.vert.glsl"
import { Object3D, Object3DEventMap, Vector2 } from "three";
import sleep from "@/shared/utils/sleep";

function updateDitherUniforms(pass: ShaderPass, scene: Scene, sceneWidth: number, sceneHeight: number, mode: "normal" | "stable" | "quantized") {

    if (mode == "normal") return;

    //@ts-expect-error - property does exist, just not typed.
    const aspect = scene.threeCamera.aspect;
    //@ts-expect-error - property does exist, just not typed.
    const FOV = scene.threeCamera.fov

    const HFOV = 2 * Math.atan(Math.tan(toRadians(FOV) / 2) * aspect)

    const body = scene.threeCamera.parent; // Parent element = body
    const yaw = body?.rotation?.y ?? 0.0; // fallback to 0
    const pitch = scene.threeCamera.rotation.x;

    const offsetX = -(sceneWidth * yaw) / HFOV;
    const offsetY = (sceneHeight * pitch) / toRadians(FOV);

    if (mode == "stable") {
        pass.uniforms.offsetX.value = Math.round(offsetX);
        pass.uniforms.offsetY.value = Math.round(offsetY);
    }

    if (mode == "quantized") {
        // Ref: https://devforum.play.date/t/preventing-dither-flashing-flickering-on-moving-objects-by-snapping-to-even-pixels/3924
        // TLDR; only move @ 2px increments to lessen flicker.
        pass.uniforms.offsetX.value = 2 * Math.floor(offsetX / 2 + 0.5);
        pass.uniforms.offsetY.value = 2 * Math.floor(offsetY / 2 + 0.5);
    }

}

// Indicates a mesh to by outlined by the OutlinePass effect. Currently associated with "hovering" (mouseover).
export const [outlinedMesh, setOutlinedMesh] = createSignal<Object3D<Object3DEventMap> | null>(null);

function updateOutlineUniforms(pass: OutlinePass) {
    pass.selectedObjects = outlinedMesh() ? [outlinedMesh()!] : [];
}

export default function applyDGShader(scene: Scene, mode = "quantized" as "quantized" | "normal" | "stable", dimensionOverride?: { width: number, height: number }) {
    if (!scene.glRenderer) {
        throw new Error("[applyDGShader] Scene GL instance not ready yet. scene.glRenderer could not be found.");
    };

    const composer = new EffectComposer(scene.glRenderer);

    // Constant render dimensions regardless of scale. Preserve pixelation.
    const { width: WIDTH, height: HEIGHT } = dimensionOverride ?? SCENE_DIMENSIONS;

    /*
    Composer pixel ratio controls the render/PP resolution. Keep resolution reliable through pipeline. We don't want to distort the dithering pattern on HiDPI.
    glRenderer pixel ratio relates to the canvas being painted on. It should use the device ratio to keep pixels sharp and handle resizing correctly.
    This configuration works well on both HiDPI and normal displays.
    */
    composer.setPixelRatio(1);
    scene.glRenderer.setPixelRatio(window.devicePixelRatio);

    composer.setSize(WIDTH, HEIGHT);
    scene.glRenderer.setSize(WIDTH, HEIGHT, false); // false = don't update canvas.style

    // Some constants and data needed for shader logic...
    // @ts-ignore
    scene.camera.fov = FOV;

    // Generic Passes
    const renderPass = new RenderPass(scene.three, scene.threeCamera);
    const outputPass = new OutputPass();

    // Main Effect (Dithering).
    const visualEffectPass = new ShaderPass({
        vertexShader: pp_vertshader,
        fragmentShader: pp_fragshader,
        uniforms: {
            tDiffuse: { value: null },
            lumaCutoff: { value: 0.0 },
            screensize: { value: new Vector2(WIDTH, HEIGHT) },
            gamma: { value: 0.95 },
            offsetX: { value: 0 },
            offsetY: { value: 0 }
        },
    });

    const outlinePass = new OutlinePass(
        new Vector2(WIDTH, HEIGHT),
        scene.three,
        scene.threeCamera
    );

    composer.addPass(renderPass);
    composer.addPass(outlinePass);
    composer.addPass(visualEffectPass); // Dithering, gamma correction, etc...
    composer.addPass(outputPass);

    // Always render the scene from the active camera
    scene.drawScene = () => {
        renderPass.camera = scene.threeCamera;
        outlinePass.renderCamera = scene.threeCamera;

        updateDitherUniforms(visualEffectPass, scene, WIDTH, HEIGHT, mode);
        updateOutlineUniforms(outlinePass);

        composer.render();
    };
}

export const useDGShader = (getScene: () => Scene, mode?: 'normal' | 'stable' | 'quantized', dimensionOverride?: { width: number, height: number }) => {
    const ATTEMPT_TIMEOUT_MS = 5000;

    const start = performance.now();
    const x = () => {
        requestAnimationFrame(() => {
            const s = getScene();
            if (!s) {
                if (performance.now() - start >= ATTEMPT_TIMEOUT_MS) return;
                sleep(10).then(x); // retry
            }
            else applyDGShader(s, mode, dimensionOverride);
        })
    }

    onMount(() => x())
};