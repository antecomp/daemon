import { overlayAnimations } from "@/core/battle/animation/animations.reg";
import { overlayAnimRequests } from "@/core/battle/animation/requestOverlayAnim";
import { battleAssetManager } from "@/core/battle/engine/battle.logic";
import sleep from "@/util/sleep";
import { createEffect } from "solid-js";
import rit_shcosk from "@/assets/animations/overlays/slash/djdj.webm"

export default function OverlayAnimator() {
    let overlayConRef: HTMLDivElement | undefined;

    const processedAnimations = new Set(); // Track animations already processed. Reference comment below.
    
    createEffect(() => {
        overlayAnimRequests().forEach(({name, position, id, onFinish}) => {

            // Prevent duplicates, since signal change will append all animations again, INCLUDING ALREADY PLAYING ONES,
            // we have to make sure to skip those.
            if (processedAnimations.has(id)) return;
            processedAnimations.add(id); // Mark animation as processed

            const config = overlayAnimations[name];
            if (!config) {
                console.error(`Animation "${name}" not found`);
                return;
            }

            const { src, frameWidth, frameHeight, totalFrames, frameRate } = config;
            const duration = (totalFrames / frameRate) * 1000; // Frames to ms.

            const img = battleAssetManager.getImage(src); // Image cache
            if(!img) {
                console.error(`[OverlayAnimator] Image for animation "${name}" not preloaded. Failed to get ${src}`);
                return;
            }

            //const sprite = document.createElement("div");

            //createImageBitmap(img).then(imgbm => {}/* noop */);

            //console.log(battleAssetManager.buffers.get(src));
            

            // Object.assign(sprite.style, {
            //     position: "absolute",
            //     translate: `${position[0]}px ${position[1]}px`,
            //     width: `${frameWidth}px`,
            //     height: `${frameHeight}px`,
            //     backgroundImage: `url(${img.src})`,
            //     backgroundRepeat: "no-repeat",

            //     // Hinting for optimization
            //     // willChange: "transform, background-position",
            //     // transform: "translateZ(0)", // forces GPU acceleration
            //     // backfaceVisibility: "hidden", // optimize GPU acceleration
            //     // contain: "strict" // idk
            // } as CSSStyleDeclaration);

            //overlayConRef?.appendChild(sprite);
            // sprite.animate(
            //     [{ backgroundPosition: "0px" }, { backgroundPosition: `-${frameWidth * totalFrames}px` }],
            //     {
            //         duration,
            //         iterations: 1,
            //         easing: `steps(${totalFrames})`
            //     }
            // ).onfinish = () => {
            //     sprite.remove();
            //     onFinish(); // CB sent by request, used to resolve promise.
            //     processedAnimations.delete(id); // Allow new animations with this ID
            // }
            //sleep(duration * 2).then(() => sprite.remove());

            const video = document.createElement("video");
            video.src = rit_shcosk;
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;

            Object.assign(video.style, {
                position: "absolute",
                translate: `${position[0]}px ${position[1]}px`,
                width: frameWidth,
                height: frameHeight,
                mixBlendMode: "difference", // try other modes too
                pointerEvents: "none",
                willChange: "transform",
                transform: "translateZ(0)"
            });

            video.onended = () => {
                console.log("done playing!");
                video.remove();
            };

            overlayConRef?.appendChild(video);
            video.play();

        })
    })


    return <div id="overlay-animation-container" ref={overlayConRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", "pointer-events": "none" }} />;
}