import { FOV } from "@/config/3d.config";
import { SCENE_DIMENSIONS } from "@/config/ui.config";
import { Scene, toRadians } from "lume";
import {createSignal, onMount} from "solid-js"
import { EffectComposer, OutlinePass, OutputPass, RenderPass, ShaderPass } from "three/examples/jsm/Addons.js";
import pp_fragshader from "@/3d/shaders/post-processing/dg.frag.glsl"
import pp_vertshader from "@/3d/shaders/post-processing/pass.vert.glsl"
import { Object3D, Object3DEventMap, Vector2 } from "three";
import sleep from "@/shared/utils/sleep";

function updateDitherUniforms (pass: ShaderPass, scene: Scene, sceneWidth: number, sceneHeight: number, mode: "normal" | "stable" | "quantized") {
    
    if(mode == "normal") return;
    
    //@ts-ignore
    const aspect = scene.threeCamera.aspect;
    //@ts-ignore
    const FOV = scene.threeCamera.fov

    const HFOV = 2 * Math.atan(Math.tan(toRadians(FOV) / 2) * aspect)

    const body = scene.threeCamera.parent; // Parent element = body
    const yaw = body?.rotation?.y ?? 0.0; // fallback to 0
    const pitch = scene.threeCamera.rotation.x;

    const offsetX = -(sceneWidth * yaw) / HFOV;
    const offsetY = (sceneHeight * pitch) / toRadians(FOV);

    if(mode == "stable") {
        pass.uniforms.offsetX.value = Math.round(offsetX); 
        pass.uniforms.offsetY.value = Math.round(offsetY);
    } else if (mode == "quantized") {
        // Ref: https://devforum.play.date/t/preventing-dither-flashing-flickering-on-moving-objects-by-snapping-to-even-pixels/3924
        // Tldr only move @ 2px increments to lessen flicker. Not a resolution but it helps.
        pass.uniforms.offsetX.value = 2 * Math.floor(offsetX / 2 + 0.5);
        pass.uniforms.offsetY.value = 2 & Math.floor(offsetY / 2 + 0.5);
    }

}

// Global signal so the OutlinePass in dgRender can easily observe who is actively being hovered.
export const [hoveredItem, setHoveredItem] = createSignal<Object3D<Object3DEventMap> | null>(null);

function updateOutlineUniforms(pass: OutlinePass) {
    pass.selectedObjects = hoveredItem() ? [hoveredItem()!] : [];
}

export default function applyDGShader(scene: Scene, mode = "quantized" as "quantized" | "normal" | "stable", dimensionOverride?: {width: number, height: number}) {
    if(!scene.glRenderer) {
        console.warn('[applyDGShader] Scene GL instance not ready yet.');
        throw new Error("[applyDGShader] Scene GL instance not ready yet. scene.glRenderer could not be found.");
        return;
    };

    const composer = new EffectComposer(scene.glRenderer);

    // Constant render dimensions regardless of scale.
    const {width: WIDTH, height: HEIGHT} = dimensionOverride ?? SCENE_DIMENSIONS;

    // composer 1 + window.devicePixelRatio on glRenderer seems to be the combination needed to make this work
    // well on both HiDPI and normal displays.
    // This is only because we're no longer zooming to scale UI (which would change reported ratio)
    // and instead we're scaling the whole UI with css.

	composer.setPixelRatio(1);
	composer.setSize(WIDTH, HEIGHT);

    
	scene.glRenderer.setPixelRatio(window.devicePixelRatio);
	scene.glRenderer.setSize(WIDTH, HEIGHT, false); // false = don't update canvas.style

    // Some constants and data needed for shader logic...
    // @ts-ignore
    scene.camera.fov = FOV;
   

    // Generic Passes
    const renderPass = new RenderPass(scene.three, scene.threeCamera);
	const outputPass = new OutputPass();

    const effectPass = new ShaderPass({
        vertexShader: pp_vertshader,
        fragmentShader: pp_fragshader,
        uniforms: {
            tDiffuse: { value: null },
            lumaCutoff: { value : 0.0 },
            screensize: {value : new Vector2(WIDTH, HEIGHT)},
            gamma: {value : 0.95},
            offsetX: {value: 0},
            offsetY: {value: 0}
        },
    });

    const outlinePass = new OutlinePass(
        new Vector2(WIDTH, HEIGHT),
        scene.three,
        scene.threeCamera
    );

    composer.addPass(renderPass);
    composer.addPass(outlinePass);
    composer.addPass(effectPass); // Dithering, gamma correction, etc...
	composer.addPass(outputPass);

    // Always render the scene from the active camera
	scene.drawScene = () => {
		renderPass.camera = scene.threeCamera;
        outlinePass.renderCamera = scene.threeCamera;

        updateDitherUniforms(effectPass, scene, WIDTH, HEIGHT, mode);
        updateOutlineUniforms(outlinePass);

		composer.render();
	};
}

export const useDGShader = (getScene: () => Scene, mode?: 'normal' | 'stable' | 'quantized', dimensionOverride?: {width: number, height: number}) => {

    const x = () => {
        // console.log('attempting'); // seems to only play onceundefined
        requestAnimationFrame(() => {
            const s = getScene();
            if (!s) sleep(10).then(x) // retry
            else applyDGShader(s, mode, dimensionOverride);
        })
    }

    onMount(() => x())
};
