import { MoveLexicon } from "@/features/battlenew/lexicon/lexicon.types";
import { BattleUIState, useBattleUIState } from "../Battle";
import { Point } from "@/shared/types/3d.types";
import { createTooltip } from "@/shared/hooks/createTooltip";
import { For } from "solid-js";
import { PlayerRuneName, playerRuneNames } from "@/core/battlenew/moves/runeRegistry";
import { MoveTooltipContent } from "./MoveTooltipContent";

const RUNEBUILDER_RADIUS = 89;
const SVG_DIM = RUNEBUILDER_RADIUS * 2.7;
const CENTER = SVG_DIM / 2;
const RB_INACTIVE_COLOUR = "#999";
const RB_ACTIVE_COLOUR = "white";

export default function Runebuilder(props: {
    lexicon: MoveLexicon,
    appendToPlan: (toAdd: PlayerRuneName) => void;
    planBuffer: string[] 
}) {
    const {battleUIState} = useBattleUIState();

    const { showTooltip, hideTooltip, TooltipComponent } = createTooltip();

    const runePositions = new Map<string, Point>();

    return (
        <>
            <TooltipComponent/>
            <svg width={SVG_DIM} height={SVG_DIM} id="runebuilder">
                {/* Main container circle */}
                <circle
                    cx={CENTER} cy={CENTER}
                    r={RUNEBUILDER_RADIUS}
                    stroke={(battleUIState() != BattleUIState.WAITING) ? "white" : "#aaa"}
                    stroke-width="2"
                    fill="black"
                />

                {/* Rune Lines */}
                <g>
                    <For each={props.planBuffer.slice(1)}>
                        {(runename, index) => {
                            const prev = props.planBuffer[index()];
                            const prevPos = runePositions.get(prev);
                            const currRune = runePositions.get(runename);

                            if (!currRune || !prevPos) return null;

                            return (
                                <line
                                    x1={prevPos.x} y1={prevPos.y}
                                    x2={currRune.x} y2={currRune.y}
                                    stroke="white"
                                    stroke-width="2"
                                />                                
                            )
                        }}
                    </For>
                </g>

                {/* Rune Button Circles */}
                <g>
                    <For each={playerRuneNames}>
                        {(runename, index) => {
                            const angle = (Math.PI * 2 * index()) / playerRuneNames.length
                            const x = CENTER + RUNEBUILDER_RADIUS * Math.cos(angle);
                            const y = CENTER + RUNEBUILDER_RADIUS * Math.sin(angle);

                            runePositions.set(runename, {x,y});

                            return (
                                <>
                                    <circle
                                        cx={x} cy={y}
                                        r={RUNEBUILDER_RADIUS / 4}
                                        stroke={props.planBuffer.includes(runename) ? RB_ACTIVE_COLOUR : RB_INACTIVE_COLOUR}
                                        fill="black"
                                        onClick={() => props.appendToPlan(runename)}
                                        onMouseEnter={() => showTooltip(() => <MoveTooltipContent runeName={runename} lexicon={props.lexicon}/>)}
                                        onMouseOut={() => hideTooltip()}
                                    ></circle>
                                    <image
                                        href={props.lexicon[runename].largeIcon}
                                        x={x - 16} // TODO - REMOVE THIS MAGIC NUMBER!!!
                                        y={y - 16}
                                        preserveAspectRatio="xMidYMid meet"
                                    />
                                </>
                            )
                        }}
                    </For>
                </g>
            </svg>
        </>
    )
}