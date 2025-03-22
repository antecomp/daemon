import { createSignal, Show } from "solid-js";

// Exposed signature for animate function.
export type MeltAnimationFn = (pingPong?: boolean, maxScale?: number, duration?: number) => Promise<void>;

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
 *       - `pingPong` (optional): If true, animation goes initial -> max -> back to initial.
 *       - `maxScale` (optional): The maximum scale value for the animation.
 *       - `duration` (optional, default 1s): Duration of the animation.
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

    const [showFilter, setShowFilter] = createSignal(false);

    const [animationProps, setAnimationProps] = createSignal({
        values: `${initialScale};${initialScale}`,
        dur: "1s" // fallback duration
    });

    let animateElement: SVGAnimateElement | undefined = undefined;

    async function startMeltAnimation(pingPong = false, maxScale = 10, duration = 1): Promise<void> {
        setShowFilter(true);

        return new Promise<void>(async (resolve, reject) => {
            if(!animateElement) {
                setShowFilter(false);
                return reject("Animate element not ready");
            }

            const values = pingPong
                ? `${initialScale};${maxScale};${initialScale}`
                : `${initialScale};${maxScale}`

            setAnimationProps({
                values,
                dur: `${duration}s`
            });

            const handleEnd = () => {
                animateElement?.removeEventListener("endEvent", handleEnd);
                setShowFilter(false);
                resolve();
            };

            animateElement.addEventListener("endEvent", handleEnd);

            // Another stupid "kicker" - this time for chrome. If beginElement triggers arbitrarily early it noops,
            // this lets the browser catch up. Await sleep(0) doesn't work. <- timeout schedules different from reqAnimFrame.
            await new Promise(r => requestAnimationFrame(r));

            animateElement.beginElement();
        })
    }

    return {
        startMeltAnimation,
        filterID,
        filterSVG: (
            <Show when={showFilter()}>
                <svg
                    style={{
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
                                scale={initialScale.toString()}
                                xChannelSelector="R"
                                yChannelSelector="G"
                            >
                                <animate
                                    ref={el => animateElement = el}
                                    attributeName="scale"
                                    begin="indefinite"
                                    dur={animationProps().dur}
                                    values={animationProps().values}
                                    fill="freeze"
                                />
                            </feDisplacementMap>
                        </filter>
                    </defs>
                </svg>
            </Show>
        )
    };

}