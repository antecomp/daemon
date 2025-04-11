import { BattleUIState, useBattleUIState } from "@/core/battle/engine/battle.context";
import { PlayerMoveMeta } from "@/core/battle/moves/moves.types";
import { Point } from "@/extra.types";
import { createTooltip } from "@/hooks/createTooltip";
import { For } from "solid-js";
import { MoveTooltipContent } from "./MoveTooltipContent";

const RUNEBUILDER_RADIUS = 89;
const SVG_DIM = RUNEBUILDER_RADIUS * 2.7;
const CENTER = SVG_DIM / 2;
const RB_INACTIVE_COLOUR = "#999";
const RB_ACTIVE_COLOUR = "white";

interface RunebuilderProps {
    availRunes: PlayerMoveMeta[],
    addRune: (toAdd: PlayerMoveMeta) => void,
    sequenceBuffer: PlayerMoveMeta[]
}

export default function Runebuilder(props: RunebuilderProps) {

    const { battleUIState } = useBattleUIState();

    const { showTooltip, hideTooltip, TooltipComponent } = createTooltip();

    const runePositions = new Map<PlayerMoveMeta, Point>();

    return (
        <>
            <TooltipComponent/>
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
                            const prevPos = runePositions.get(prev);
                            const currRune = runePositions.get(rune);

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
                        each={props.availRunes}
                    >
                        {(rune, index) => {
                            const angle = (Math.PI * 2 * index()) / props.availRunes.length
                            const x = CENTER + RUNEBUILDER_RADIUS * Math.cos(angle);
                            const y = CENTER + RUNEBUILDER_RADIUS * Math.sin(angle);

                            runePositions.set(rune, { x, y });

                            return (
                                <>
                                    <circle
                                        cx={x} cy={y}
                                        r={RUNEBUILDER_RADIUS / 4}
                                        stroke={props.sequenceBuffer.includes(rune) ? RB_ACTIVE_COLOUR : RB_INACTIVE_COLOUR}
                                        fill="black"
                                        onClick={() => {
                                            if (!rune.canPerform || rune.canPerform(props.sequenceBuffer)) props.addRune(rune);
                                        }}
                                        onMouseEnter={() => showTooltip(() => <MoveTooltipContent {...rune}/>)}
                                        onMouseOut={() => hideTooltip()}
                                    ></circle>
                                    <image
                                        href={rune.rbIcon}
                                        x={x - 16}
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