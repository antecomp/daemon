import { hoveredItem } from "@/components/util/Interactable";
//import ditherShader from "@/shaders/dither.shader";
import { Scene } from "lume";
import { Vector2 } from "three";
import { OutlinePass, OutputPass, RenderPass } from "three/examples/jsm/Addons.js";
import { EffectComposer } from "three/examples/jsm/Addons.js";


export default function applyShader(scene: Scene) {
    if (!scene.glRenderer) return; // 
    //console.log("DEBUG glRenderer found, applying custom pass...");

    const composer = new EffectComposer(scene.glRenderer);

    // Omitting render resolution stuff for now. Add if needed.
    function setDimensions() {
        composer.setPixelRatio(window.devicePixelRatio)
        const resize = () => composer.setSize(scene.clientWidth, scene.clientHeight)
        const observer = new ResizeObserver(resize)
        observer.observe(scene)
    }

    setDimensions()

    const renderPass = new RenderPass(scene.three, scene.threeCamera);

    composer.addPass(renderPass);

    // const effectSobel = new ShaderPass(SobelOperatorShader);
    // effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
    // effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
    // composer.addPass( effectSobel );

    //composer.addPass(ditherShader); // (still needs to be implemented)

    let outlinePass = new OutlinePass(new Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio), scene.three, scene.threeCamera);
    composer.addPass(outlinePass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Overwrite draw method with our custom passes.
    scene.drawScene = () => {
        // idk why I had this camera thing. Seems to work without?
        //renderPass.camera = scene.threeCamera;
        outlinePass.selectedObjects = hoveredItem() ? [hoveredItem()!] : []; // Kinda gross. Will change how this works later maybe.
        composer.render();
    }

    // Trigger continuous render 
    // WARNING: THIS DOESNT DIE WITH SCENE UNMOUNT
    // If you need animations, look further into how to properly do cleanup!!!
    // Motor.addRenderTask(() => {
    //     scene.needsUpdate();
    // })

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