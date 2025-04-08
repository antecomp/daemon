import { SCENE_DIMENSIONS } from "@/config";
import { Scene } from "lume";
import { EffectComposer, OutputPass, RenderPass, ShaderPass } from "three/examples/jsm/Addons.js";
import pp_fragshader from "@/shaders/post-processing/dg.frag.glsl"
import pp_vertshader from "@/shaders/post-processing/pass.vert.glsl"

const DGPass = new ShaderPass({
    vertexShader: pp_vertshader,
    fragmentShader: pp_fragshader,
    uniforms: {
		tDiffuse: { value: null },
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
    composer.addPass(DGPass);
	composer.addPass(outputPass);

    // Always render the scene from the active camera
	scene.drawScene = () => {
		renderPass.camera = scene.threeCamera;
		composer.render();
	};
}