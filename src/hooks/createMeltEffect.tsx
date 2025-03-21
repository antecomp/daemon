import lerp from "@/util/lerp";
import { createSignal, onCleanup, Show } from "solid-js";

// Exposed signature for animate function.
export type MeltAnimationFn = (returnEffect?: boolean, maxScale?: number, speed?: number) => Promise<void>;

/**
 * Creates a melting effect using an SVG filter with a displacement map.
 * This effect can be applied to UI elements and animated with a customizable scale and speed.
 * 
 * Note: This effect may cause memory leaks in Firefox (when applied to canvas) unless the SVG is removed from the DOM or the filter is disabled.
 *
 * @param {number} [initialScale=0] - The initial scale value for the displacement map.
 * @returns An object containing:
 * 
 *   `startMeltAnimation`: A function to start the melting animation. It accepts:
 *       - `returnEffect` (optional): If true, reverses the animation after completion.
 *       - `maxScale` (optional): The maximum scale value for the animation.
 *       - `speed` (optional): The speed of the animation.
 *   `filterID`: The unique ID of the SVG filter.
 * 
 *   `filterSVG`: The JSX element containing the SVG filter definition.
 *
 * @example
 * const { startMeltAnimation, filterID, filterSVG } = createMeltingEffect(0);
 * 
 * // Apply the filter to an element
 * <div style={{ filter: `url(#${filterID})` }}>Melting Content</div>
 * 
 * // Trigger the animation
 * await startMeltAnimation(true, 10, 0.1);
 */
export function createMeltingEffect(initialScale = 0) {
    const filterID = "melting-" + String(Math.random()).substring(2, 9);

    // Firefox memleaks with this effect, itll properly release memory if we remove the SVG from the DOM or disable the filter.
    //      yet to resolve root cause beyond displacement map + canvas being the issue, works fine on other UI elements.
    const [showFilter, setShowFilter] = createSignal(false);
    let displacementMap: SVGFEDisplacementMapElement | undefined = undefined;
    let animationFrame: number;

    // nested callback hell just to resolve a promise lol
    async function startMeltAnimation(returnEffect = false, maxScale = 10, speed = 0.1): Promise<void> {
        setShowFilter(true);
        return new Promise((resolve, reject) => {
            const step = (reverse = false) => {
              if(!displacementMap) {
                setShowFilter(false);
                return reject();
            }

              const target = reverse ? initialScale : maxScale;
              const currentScale = parseFloat(displacementMap.getAttribute("scale") || initialScale.toString());
              const newScale = lerp(currentScale, target, speed);

              displacementMap.setAttribute("scale", newScale.toString());
              if(Math.abs(newScale - target) < 0.1) {
                displacementMap.setAttribute("scale", target.toString());
                if(returnEffect && !reverse) {
                    animationFrame = requestAnimationFrame(() => step(true)); // Trigger reverse anim
                } else {
                    setShowFilter(false);
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
            <Show when={showFilter()}>
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
            </Show>
        )
    }
}