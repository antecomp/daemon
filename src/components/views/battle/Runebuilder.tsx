import { For } from "solid-js";

const RUNEBUILDER_RADIUS = 89;
const SVG_DIM = RUNEBUILDER_RADIUS * 2.7;
const AVAILABLE_RUNE_COUNT = 8; // Will update based on actual prop data later.

export default function Runebuilder() {

    const CENTER = SVG_DIM / 2;

    return (
        <svg width={SVG_DIM} height={SVG_DIM} id="runebuilder">
            {/* Main Circle */}
            <circle 
                cx={CENTER} cy={CENTER}
                r={RUNEBUILDER_RADIUS}
                stroke="white"
                stroke-width="2"
                fill="black"
            ></circle>
            {/* Rune Button Circles */}
            <For 
                /* Actual rune data will go here later */
                each={[
                    "rune1", "rune2", "rune3", "rune4", "rune5", "rune6", "rune7", "rune8"
                ]}
            >
                {(_rune, index) => 
                    {
                    const angle = (Math.PI * 2 * index()) / AVAILABLE_RUNE_COUNT
                    const x = CENTER + RUNEBUILDER_RADIUS * Math.cos(angle);
                    const y = CENTER + RUNEBUILDER_RADIUS * Math.sin(angle);

                    return <circle
                        cx={x} cy={y}
                        r={RUNEBUILDER_RADIUS / 4}
                        stroke="white"
                        fill="black"
                    ></circle>}
                }
            </For>
        </svg>
    )
}