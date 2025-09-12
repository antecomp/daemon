import { createSignal, onCleanup } from "solid-js"
import { popUILayer, pushUILayer } from "../UILayerStore"
import { nanoid } from "nanoid"
import createColorTypewriter, { ColoredText } from "@/hooks/createColorTypewriter";

interface TextOverlayLine {
    line: ColoredText[],
    sideEffect?: () => void
}
export type TextOverlaySequence = TextOverlayLine[]

const TEXT_FADE_DURATION = 300;

/** TODO Document me. */
export default function TextScene(props: {
    sequence: TextOverlayLine[],
    id?: string
    onComplete?: () => void
}) {

    const [currentLine, setCurrentLine] = createSignal(0);
    const currentLineText = () => props.sequence[currentLine()].line;
    const {displayText, skipTypingAnimation, isFinished} = createColorTypewriter(currentLineText);

    let textElement!: HTMLParagraphElement // ref used to apply fade anim.

    onCleanup(() => { // do it here instead of call to end so this will trigger no matter what.
        props.onComplete?.();
    })

    let fadeLock = false; // Prevent triggering fade if it's already ongoing.
    function handleClick() {
        if(isFinished()) {
            if (currentLine() >= props.sequence.length - 1) { // end
                props.id && popUILayer(props.id);   
            } else { // advance to next line.
                if (fadeLock) return;
                fadeLock = true;
                props.sequence[currentLine()]?.sideEffect?.();
                textElement.animate(
                    [
                        {opacity: "1"},
                        {opacity: "0"}
                    ],
                    {duration: TEXT_FADE_DURATION}
                )
                setTimeout(() => {
                    setCurrentLine(prev => prev + 1);
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

            class="fademein"
            data-fade-duration="1000" // or remove - defaults to 500ms by current css setup
        >
            <p
                ref={textElement}
                style={{
                    "font-size": "32px",
                    "user-select": "none",
                    "padding": "20px",
                    "text-align": "center"
                }}
            >
                {displayText()}
            </p>
        </div>
    )
}

/** TODO DOCUMENT. */
export function playTextOverlay(sequence: TextOverlayLine[]) {
    const id = "text-scene" + nanoid();

    let resolveEnd: (() => void);
    const endTextPromise = new Promise<void>(resolve => {
        resolveEnd = resolve;
    })

    pushUILayer({
        id, 
        component: () => TextScene({sequence, id, onComplete: resolveEnd}),
        blockBehind: true,
    });

    return endTextPromise;
}