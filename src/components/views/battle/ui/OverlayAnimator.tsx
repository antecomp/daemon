import { overlayAnimations } from "@/core/battle/animation/animations.reg";
import { overlayAnimRequests, setOverlayAnimRequests } from "@/core/battle/animation/useOverlayAnim";
import { createEffect } from "solid-js";

export default function OverlayAnimator() {
    let overlayConRef: HTMLDivElement | undefined;
    
    createEffect(() => {
        overlayAnimRequests().forEach(({name, position, id}) => {
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
                console.log("finish trigger")
                sprite.remove();
                setTimeout(() => {
                  // Remove from the signal after animation completes
                  setOverlayAnimRequests((prev) => prev.filter((anim) => anim.id !== id));
                }, 0);
            }
           
        })
    })


    return <div id="overlayCon" ref={overlayConRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", "pointer-events": "none" }} />;
}