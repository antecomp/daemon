import { overlayAnimations } from "@/core/battle/animation/animations.reg";
import { overlayAnimRequests } from "@/core/battle/animation/useOverlayAnim";
import { createEffect } from "solid-js";

export default function OverlayAnimator() {
    let overlayConRef: HTMLDivElement | undefined;

    const processedAnimations = new Set(); // Track animations already processed
    
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

            const sprite = document.createElement("div");
            sprite.style.position = "absolute";
            sprite.style.left = `${position[0]}px`;
            sprite.style.top = `${position[1]}px`;
            sprite.style.width = `${frameWidth}px`;
            sprite.style.height = `${frameHeight}px`;
            sprite.style.backgroundImage = `url(${src})`;
            sprite.style.backgroundRepeat = "no-repeat";

            overlayConRef?.appendChild(sprite);

            
            sprite.animate(
                [{ backgroundPosition: "0px" }, { backgroundPosition: `-${frameWidth * totalFrames}px` }],
                {
                  duration,
                  iterations: 1,
                  easing: `steps(${totalFrames})`
                }
            ).onfinish = () => {
                sprite.remove();
                onFinish(); // CB sent by request, used to resolve promise.
                processedAnimations.delete(id); // Allow new animations with this ID
            }
           
        })
    })


    return <div id="overlay-animation-container" ref={overlayConRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", "pointer-events": "none" }} />;
}