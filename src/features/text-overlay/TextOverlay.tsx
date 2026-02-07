import { createSignal, onCleanup, Show } from "solid-js"
import { popUILayer, pushUILayer } from "@/app/shell/layers/UILayerManager";
import { nanoid } from "nanoid"
import createColorTypewriter, { SegmentInput } from "@/shared/hooks/createColorTypewriter";
import animateAsync from "@/shared/utils/animateAsync";

type TextOverlayLine = {
    segments: SegmentInput[],
    sideEffect?: () => void
} | SegmentInput[]
export type TextOverlaySequence = TextOverlayLine[]

const TEXT_FADE_DURATION = 300;

/**
 * Renders a full-screen text overlay that typewrites the provided sequence and
 * dismisses itself once the final line finishes.
 */
export default function TextOverlay(props: {
    sequence: TextOverlayLine[],
    id?: string
    onComplete?: () => void,
    skipFadeIn?: boolean,
}) {

    let containerRef!: HTMLDivElement;

    const [currentLineIndex, setCurrentLineIndex] = createSignal(0);
    const currentLineSegs = () => {
        const currentLine = props.sequence[currentLineIndex()];
        return "segments" in currentLine
            ? currentLine.segments
            : currentLine
    }
    const { displayWithLineBreaks, skipTypingAnimation, isFinished } = createColorTypewriter(currentLineSegs);

    let textElement!: HTMLParagraphElement // ref used to apply fade anim.

    onCleanup(() => { // do it here instead of call to end so this will trigger no matter what.
        props.onComplete?.();
    })

    let fadeLock = false; // Prevent triggering fade if it's already ongoing.
    function handleClick() {
        if (isFinished()) {
            if (currentLineIndex() >= props.sequence.length - 1) { // end
                if (fadeLock) return;
                fadeLock = true;
                const currentLine = props.sequence[currentLineIndex()];
                "sideEffect" in currentLine && currentLine.sideEffect?.();
                animateAsync(containerRef, [
                    { opacity: 1 }, { opacity: 0 }
                ], 1000).finally(() => {
                    props.id && popUILayer(props.id);
                })
            } else { // advance to next line.
                if (fadeLock) return;
                fadeLock = true;
                const currentLine = props.sequence[currentLineIndex()];
                "sideEffect" in currentLine && currentLine.sideEffect?.();
                textElement.animate(
                    [
                        { opacity: "1" },
                        { opacity: "0" }
                    ],
                    { duration: TEXT_FADE_DURATION + 100 }
                )
                setTimeout(() => {
                    setCurrentLineIndex(prev => prev + 1);
                    fadeLock = false;
                }, TEXT_FADE_DURATION)
            }
        } else {
            skipTypingAnimation();
        }
    }

    return (
        <div
            onclick={handleClick}
            style={{
                // background: "#000000af",
                background: "black",
                width: "100%",
                height: "100%",
                display: "flex",
                "justify-content": "center",
                "align-items": "center"
            }}
            ref={containerRef}
            class={props.skipFadeIn ? "" : "fademein"}
            data-fade-duration="1000" // or remove - defaults to 500ms by current css setup
        >
            <p
                ref={textElement}
                style={{
                    "font-size": "32px",
                    "user-select": "none",
                    "padding": "20px",
                    "text-align": "center",
                    "pointer-events": "none" // allowing clicking through text to trigger handleClick.
                }}
            >
                {displayWithLineBreaks()}
            </p>
            <Show when={isFinished()}>
                <p
                    style={{
                        'position': 'absolute',
                        'bottom': '0px',
                        'right': '0px',
                        'color': 'gray',
                        'animation-delay': '3s'
                    }}
                    class='fademein'
                >
                    [ Click to continue ]
                </p>
            </Show>
        </div>
    )
}

/**
 * Starts a new text overlay cutscene as a UI layer.
 * @param sequence - An array of TextOverlayLines, which are either `['text', 'color']`, or `{segments: ['text', 'color'], sideEffect: () => void}`
 * @param skipFadeIn - Optional skip of the fade in effect.
 * @returns a promise that resolves when the text is completed. 
 */
export function playTextOverlay(sequence: TextOverlayLine[], skipFadeIn = false) {
    const id = "text-scene" + nanoid();

    const { promise: endTextPromise, resolve: resolveEnd } = Promise.withResolvers();

    pushUILayer({
        id,
        component: () => TextOverlay({ sequence, id, onComplete: resolveEnd as () => void, skipFadeIn }),
        blockBehind: true,
        lock: 'all'
    });

    return endTextPromise;
}
