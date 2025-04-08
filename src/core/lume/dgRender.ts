import { SCENE_DIMENSIONS } from "@/config";
import { Scene } from "lume";
import { EffectComposer, OutputPass, RenderPass, ShaderPass } from "three/examples/jsm/Addons.js";
import pp_fragshader from "@/shaders/post-processing/dg.frag.glsl"
import pp_vertshader from "@/shaders/post-processing/pass.vert.glsl"
import { Vector2 } from "three";

const DGPass = new ShaderPass({
    vertexShader: pp_vertshader,
    fragmentShader: pp_fragshader,
    uniforms: {
		tDiffuse: { value: null },
        lumaCutoff: { value : 0.1 },
        screensize: {value : new Vector2(SCENE_DIMENSIONS.width, SCENE_DIMENSIONS.height)},
        gamma: {value : 0.95}
	},
})

export default function applyDGShader(scene: Scene) {
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

    const renderPass = new RenderPass(scene.three, scene.threeCamera);
	const outputPass = new OutputPass();

    composer.addPass(renderPass);
    composer.addPass(DGPass); // Dithering, gamma correction, etc...
	composer.addPass(outputPass);

    // Always render the scene from the active camera
	scene.drawScene = () => {
		renderPass.camera = scene.threeCamera;
		composer.render();
	};
}