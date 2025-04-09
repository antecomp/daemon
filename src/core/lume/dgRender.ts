import { FOV, SCENE_DIMENSIONS } from "@/config";
import { Scene, toRadians } from "lume";
import { EffectComposer, OutputPass, RenderPass, ShaderPass } from "three/examples/jsm/Addons.js";
import pp_fragshader from "@/shaders/post-processing/dg.frag.glsl"
import pp_vertshader from "@/shaders/post-processing/pass.vert.glsl"
import { Vector2 } from "three";

function updateUniforms (pass: ShaderPass, scene: Scene, sceneWidth: number, sceneHeight: number, mode: "normal" | "stable" | "quantized") {
    
    if(mode == "normal") return;
    
    //@ts-ignore
    const aspect = scene.threeCamera.aspect;
    //@ts-ignore
    const FOV = scene.threeCamera.fov

    const HFOV = 2 * Math.atan(Math.tan(toRadians(FOV) / 2) * aspect)

    const body = scene.threeCamera.parent; // Parent element = body (for multicam)
    const yaw = body?.rotation?.y ?? 0.0; // fallback to 0
    const pitch = scene.threeCamera.rotation.x;

    const offsetX = -(sceneWidth * yaw) / HFOV;
    const offsetY = (sceneHeight * pitch) / toRadians(FOV);

    if(mode == "stable") {
        // Try without rounding later, I'm curious.
        pass.uniforms.offsetX.value = Math.round(offsetX); 
        pass.uniforms.offsetY.value = Math.round(offsetY)
    } else if (mode == "quantized") {
        // Ref: https://devforum.play.date/t/preventing-dither-flashing-flickering-on-moving-objects-by-snapping-to-even-pixels/3924
        // Tldr only move @ 2px increments to lessen flicker. Not a resolution but it helps.
        pass.uniforms.offsetX.value = 2 * Math.floor(offsetX / 2 + 0.5);
        pass.uniforms.offsetY.value = 2 & Math.floor(offsetY / 2 + 0.5);
    }

}

export default function applyDGShader(scene: Scene, mode = "quantized" as "quantized" | "normal" | "stable") {
    if(!scene.glRenderer) {
        console.warn('[applyDGShader] Scene GL instance not ready yet.');
        return;
    };

    const composer = new EffectComposer(scene.glRenderer);

    // Constant render dimensions regardless of scale.
    const {width: WIDTH, height: HEIGHT} = SCENE_DIMENSIONS;

    // Lock pixel ratio to 1 (Ignore Retina/Pixel-Dense Screens)
	composer.setPixelRatio(1);
	composer.setSize(WIDTH, HEIGHT);

    // Also lock renderer size and pixel ratio
	scene.glRenderer.setPixelRatio(1);
	scene.glRenderer.setSize(WIDTH, HEIGHT, false); // false = don't update canvas.style

    // Some constants and data needed for shader logic...
    // @ts-ignore
    scene.camera.fov = FOV;
   

    // Generic Passes
    const renderPass = new RenderPass(scene.three, scene.threeCamera);
	const outputPass = new OutputPass();


    const DGPass = new ShaderPass({
        vertexShader: pp_vertshader,
        fragmentShader: pp_fragshader,
        uniforms: {
            tDiffuse: { value: null },
            lumaCutoff: { value : 0.1 },
            screensize: {value : new Vector2(WIDTH, HEIGHT)},
            gamma: {value : 0.95},
            offsetX: {value: 0},
            offsetY: {value: 0}
        },
    })

    composer.addPass(renderPass);
    composer.addPass(DGPass); // Dithering, gamma correction, etc...
	composer.addPass(outputPass);

    // Always render the scene from the active camera
	scene.drawScene = () => {
		renderPass.camera = scene.threeCamera;
        // note: outline pass takes it's own camera, you'll need to update it too.

        updateUniforms(DGPass, scene, WIDTH, HEIGHT, mode);
		composer.render();
	};
}