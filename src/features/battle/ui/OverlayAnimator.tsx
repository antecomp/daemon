// Just doing a very lazy port for now, we can always redesign this component later!

import { Accessor, createEffect } from "solid-js";
import { OverlayAnimData, OverlayAnimReq } from "../animation/overlayAnimations/overlayAnimations.types";
import { overlayAnimationDefinitions } from "../animation/overlayAnimations/overlayAnimationDefinitions";

import './overlay-animator.css';

export default function OverlayAnimator(props: {
    overlayAnimationRequests: Accessor<OverlayAnimReq[]>
}) {
    let overlayContainerRef!: HTMLDivElement;

    const processedAnimationRequests = new Set();

    createEffect(() => {
            props.overlayAnimationRequests().forEach(({name, position, id, onFinish}) => {

                // Skip animations we've already triggered.
                if(processedAnimationRequests.has(id)) return; 
                processedAnimationRequests.add(id);
                
                const config = overlayAnimationDefinitions[name] as OverlayAnimData;
                if (!config) {
                    console.error(`Animation "${name}" not found`);
                    return;
                }

                const {src, width, height} = config;

                const video = document.createElement('video');
                video.src = src;
                video.autoplay = true;
                video.muted = true;
                video.playsInline = true;
                video.className = "overlay-animation"
                video.width = width; video.height = height;
                video.style.translate = `${position[0]}px ${position[1]}px`;
                video.style.mixBlendMode = config.blendMode ?? 'difference';

                video.onended = () => {
                    //console.log("overlay animation done playing");
                    processedAnimationRequests.delete(id);
                    video.remove();
                    onFinish();
                }

                overlayContainerRef.appendChild(video);
                video.play();
            })
    });

    return (<div 
        class="overlay-animation-container"
        ref={overlayContainerRef}
    />)
}