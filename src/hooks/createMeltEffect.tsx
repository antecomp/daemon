import lerp from "@/util/lerp";
import { onCleanup } from "solid-js";

export function createMeltingEffect(initialScale = 2, maxScale = 10, speed = 0.1, returnEffect = false) {
    const filterID = "melting-" + String(Math.random()).substring(2, 9);
    let displacementMap: SVGFEDisplacementMapElement | undefined = undefined;
    let animationFrame: number;

    // nested callback hell just to resolve a promise lol
    async function startMeltAnimation(): Promise<void> {
        return new Promise((resolve, reject) => {
            const step = (reverse = false) => {
              if(!displacementMap) return reject();

              const target = reverse ? initialScale : maxScale;
              const currentScale = parseFloat(displacementMap.getAttribute("scale") || initialScale.toString());
              const newScale = lerp(currentScale, target, speed);

              displacementMap.setAttribute("scale", newScale.toString());
              if(Math.abs(newScale - target) < 0.1) {
                displacementMap.setAttribute("scale", target.toString());
                if(returnEffect && !reverse) {
                    animationFrame = requestAnimationFrame(() => step(true)); // Trigger reverse anim
                } else {
                    resolve(); // Otherwise animation is done.
                }
                return;
              }

              // Recurse (continue).
              animationFrame = requestAnimationFrame(() => step(reverse));
            };

            // init.
            animationFrame = requestAnimationFrame(() => step(false));
        });
    }

    onCleanup(() => {
        cancelAnimationFrame(animationFrame);
    })

    return {
        startMeltAnimation,
        filterID,
        filterSVG: (
            <svg
            style={{
                // eat rocks firefox. display: none works in chrome why must you hurt me like this,.
                visibility: "hidden",
                width: "0px",
                height: "0px",
                position: "absolute"
            }}
            >
                <defs>
                    <filter id={filterID}>
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.01 0.3"
                            numOctaves="3"
                            seed="2"
                            result="turbulence"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            ref={displacementMap}
                            in2="turbulence"
                            scale={initialScale.toString()}
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>
        )
    }
}