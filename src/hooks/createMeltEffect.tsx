import lerp from "@/util/lerp";
import { createSignal, onCleanup } from "solid-js";

export function createMeltingEffect(initialScale = 2, maxScale = 10, speed = 0.1, returnEffect = false) {
    const filterID = "melting-" + String(Math.random()).substring(2, 9);
    const [scale, setScale] = createSignal(initialScale);

    let animationFrame: number;

    // nested callback hell just to resolve a promise lol
    async function startMeltAnimation(): Promise<void> {
        return new Promise((resolve) => {
            const step = (reverse = false) => {
                setScale((current) => {
                    const target = reverse ? initialScale : maxScale;
                    const newScale = lerp(current, target, speed);

                    // Close enough, we may under/overshoot
                    // if (Math.abs(newScale - maxScale) < 0.1) {
                    //     resolve();
                    //     return maxScale;
                    // }

                    if(Math.abs(newScale - target) < 0.1) {
                        if(returnEffect && !reverse) {
                            animationFrame = requestAnimationFrame(() => step(true));
                        } else {
                            resolve(); // Animation end.
                        }
                        return target;
                    }

                    animationFrame = requestAnimationFrame(() => step(reverse));
                    return newScale;
                })
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
                            in2="turbulence"
                            scale={scale()}
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>
        )
    }
}