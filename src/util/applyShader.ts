import { Motor, Scene } from "lume";
import { Vector2 } from "three";
import { GlitchPass, OutputPass, RenderPass, ShaderPass, SobelOperatorShader } from "three/examples/jsm/Addons.js";
import { EffectComposer } from "three/examples/jsm/Addons.js";


export default function applyShader(scene: Scene) {
    if(!scene.glRenderer) return; // I don't think this will ever be the case.
    console.log("trigger");

    const composer = new EffectComposer(scene.glRenderer);

    // Omitting render resolution stuff for now. Add if needed.
	function setDimensions() {
		composer.setPixelRatio(window.devicePixelRatio)
		const resize = () => composer.setSize(scene.clientWidth, scene.clientHeight)
		const observer = new ResizeObserver(resize)
		observer.observe(scene)
	}

	// If you do things manually with Three.js, you need to make sure to set the
	// proper rendering dimensions. Comment this out and it will still work, but
	// the demo may be lower resolution and look pixelated.
	setDimensions()

    const renderPass = new RenderPass(scene.three, scene.threeCamera);

    composer.addPass(renderPass);

    //const glitchPass = new GlitchPass();
    //composer.addPass(glitchPass);

    const effectSobel = new ShaderPass(SobelOperatorShader);
    effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
    effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
    composer.addPass( effectSobel );

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Overwrite draw method with our custom passes.
    scene.drawScene = () => {
        console.log("utilizing new draw");
        renderPass.camera = scene.threeCamera;

        composer.render();
    }

    //console.log("x", drawScene);

    // Trigger continuous render 
    // PRIO TODO: NEED CLEANUP WHEN SCENE UNMOUNTS 
    // (OR MOVE LUME SCENE TO SCENECONTAINER TO USE SAME SHADER EVERYWHERE, NO CLEANUP)
    Motor.addRenderTask(() => {
        scene.needsUpdate();
    })

}

/* 
https://docs.lume.io/guide/custom-rendering/
The Motor.addRenderTask part of the example calls scene.needsUpdate() 
repeatedly because the GlitchPass applies an animated effect. If you are 
using a pass that is not animated and needs to only render for a single 
frame, then you do not need to make an update loop because the scene will 
update automatically when any of its content changes. In that example, 
the scene has no idea the GlitchPass exists because we’ve stepped outside of 
Lume’s control and are wiring in custom Three.js stuff, so the scene will not 
automatically know that it should update.
*/