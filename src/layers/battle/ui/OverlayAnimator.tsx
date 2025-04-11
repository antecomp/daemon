import { overlayAnimations } from "@/core/battle/animation/overlayAnimsRegistry";
import { overlayAnimRequests } from "@/core/battle/animation/requestOverlayAnim";
import { createEffect } from "solid-js";

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

            const { src, width, height } = config;

            const video = document.createElement("video");
            video.src = src;
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;

            Object.assign(video.style, {
                position: "absolute",
                translate: `${position[0]}px ${position[1]}px`,
                width: width,
                height: height,
                mixBlendMode: "difference",
                pointerEvents: "none",
                willChange: "transform",
                transform: "translateZ(0)"
            });

            video.onended = () => {
                console.log("done playing!");
                processedAnimations.delete(id);
                video.remove();
                onFinish();
            };

            overlayConRef?.appendChild(video);
            video.play();

        })
    })


    return <div id="overlay-animation-container" ref={overlayConRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", "pointer-events": "none" }} />;
}