import { BattleUIState, useBattleUIState } from "@/core/battle/engine/battle.context";
import { MoveData, PlayerMoveData } from "@/core/battle/engine/battle.types";
import { Point } from "@/extra.types";
import { For } from "solid-js";

const RUNEBUILDER_RADIUS = 89;
const SVG_DIM = RUNEBUILDER_RADIUS * 2.7;
const AVAILABLE_RUNE_COUNT = 8; // Will update based on actual prop data later.

interface RunebuilderProps {
    availRunes: PlayerMoveData[], 
    addRune: (toAdd: MoveData) => void,
    sequenceBuffer: MoveData[]
}

export default function Runebuilder(props: RunebuilderProps) {

    const {battleUIState} = useBattleUIState();

    const CENTER = SVG_DIM / 2;

    const runePositions = new Map<MoveData, Point>();

    return (
        <svg width={SVG_DIM} height={SVG_DIM} id="runebuilder">
            {/* Main Circle */}
            <circle 
                cx={CENTER} cy={CENTER}
                r={RUNEBUILDER_RADIUS}
                stroke={(battleUIState() != BattleUIState.WAITING) ? "white" : "#aaa"}
                stroke-width="2"
                fill="black"
            ></circle>

            {/* Rune Lines */}
            <g>
            <For each={props.sequenceBuffer.slice(1)}>
                {(rune, index) => {

                    const prev = props.sequenceBuffer[index()];
                    const currRune = runePositions.get(rune);
                    const prevPos = runePositions.get(prev);

                    if (!currRune || !prevPos) return null;

                    return (
                        <>
                            <line
                                x1={prevPos.x} y1={prevPos.y}
                                x2={currRune.x} y2={currRune.y}
                                stroke="white"
                                stroke-width="2"
                            />
                        </>
                    )
                }}
            </For>
            </g>

            {/* Rune Button Circles */}
            <g>
            <For 
                /* Actual rune data will go here later */
                each={props.availRunes}
            >
                {(rune, index) => 
                    {
                    const angle = (Math.PI * 2 * index()) / AVAILABLE_RUNE_COUNT
                    const x = CENTER + RUNEBUILDER_RADIUS * Math.cos(angle);
                    const y = CENTER + RUNEBUILDER_RADIUS * Math.sin(angle);

                    runePositions.set(rune, { x, y });

                    return (
                        <>
                            <circle
                                cx={x} cy={y}
                                r={RUNEBUILDER_RADIUS / 4}
                                // stroke="white"
                                stroke={props.sequenceBuffer.includes(rune) ? "white" : "#aaa"}
                                // fill={(props.sequenceBuffer.includes(rune) ? "red" : "black")}
                                fill="black"
                                onClick={() => props.addRune(rune)}
                            ></circle>
                            <image
                                href={rune.rbIcon}
                                x={x - 16}
                                y={y - 16}
                                
                                preserveAspectRatio="xMidYMid meet"
                            />
                        </>
                    )
                    }
                }
            </For>
            </g>
        </svg>
    )
}