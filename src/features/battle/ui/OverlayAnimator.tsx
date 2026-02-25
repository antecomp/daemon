import './styles/overlay-animator.css';

import { Accessor, createEffect } from "solid-js";
import { OverlayAnimationTable, OverlayAnimReq } from "../animation/overlayAnimations/overlayAnimations.types";
import { COMMON_OVERLAY_ANIMATION_DEFINITIONS } from "../animation/overlayAnimations/overlayAnimationDefinitions";

export default function OverlayAnimator(props: {
    overlayAnimationRequests: Accessor<OverlayAnimReq[]>
    overlayAnimTableOverrides?: OverlayAnimationTable
}) {
    let overlayContainerRef!: HTMLDivElement;

    const processedAnimationRequests = new Set();

    const overlayAnimTable: OverlayAnimationTable = {...COMMON_OVERLAY_ANIMATION_DEFINITIONS, ...props.overlayAnimTableOverrides}
    console.log(overlayAnimTable)

    createEffect(() => {
            props.overlayAnimationRequests().forEach(({name, position, id, onFinish}) => {

                // Skip animations we've already triggered.
                if(processedAnimationRequests.has(id)) return; 
                processedAnimationRequests.add(id);
                
                const config = overlayAnimTable[name];
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