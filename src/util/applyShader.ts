import { hoveredItem } from "@/components/util/Interactable";
import { FOV, SCENE_DIMENSIONS } from "@/config";
import DitherShader from "@/shaders/dither.shader";
import ditherShader from "@/shaders/dither.shader";
//import ditherShader from "@/shaders/dither.shader";
import { Scene } from "lume";
import { Vector2 } from "three";
import { OutlinePass, OutputPass, RenderPass, ShaderPass, SobelOperatorShader } from "three/examples/jsm/Addons.js";
import { EffectComposer } from "three/examples/jsm/Addons.js";
import { radians } from "three/tsl";


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

    let outlinePass = new OutlinePass(new Vector2(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio), scene.three, scene.threeCamera);
    composer.addPass(outlinePass);

    //console.log(scene.clientHeight); // this is 0 :(

    // const effectSobel = new ShaderPass(SobelOperatorShader);
    // effectSobel.uniforms[ 'resolution' ].value.x = window.innerWidth * window.devicePixelRatio;
    // effectSobel.uniforms[ 'resolution' ].value.y = window.innerHeight * window.devicePixelRatio;
    // composer.addPass( effectSobel );

    const ditherPass = new ShaderPass(DitherShader);
    composer.addPass(ditherPass);

    ditherPass.uniforms.screenSize.value = new Vector2(SCENE_DIMENSIONS.width, SCENE_DIMENSIONS.height);
    //@ts-ignore
    scene.camera.fov = FOV; // FOV prop for Lume is in degrees for some reason
    function updateCameraRotation() {
        const body = scene.threeCamera.parent;  // Get parent element (body)
        const yawRotation = body ? body.rotation.y : 0.0;  // Fallback to 0 if no parent

        const pitch = scene.threeCamera.rotation.x
        //@ts-ignore
        const aspect = scene.threeCamera.aspect;

        // Handled in radians in the shader!
        ditherPass.uniforms.cameraRotation.value = yawRotation;  // Pass body yaw to shader
        ditherPass.uniforms.cameraFov.value = Math.PI / 4;

        ditherPass.uniforms.XOffset.value = -(SCENE_DIMENSIONS.width * yawRotation) / (2 * Math.atan(Math.tan(Math.PI / 8) * aspect));
        ditherPass.uniforms.YOffset.value = (SCENE_DIMENSIONS.height * pitch) / (Math.PI / 4);
    }

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    // Overwrite draw method with our custom passes.
    scene.drawScene = () => {
        // idk why I had this camera thing. Seems to work without?
        //renderPass.camera = scene.threeCamera;
        updateCameraRotation();
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