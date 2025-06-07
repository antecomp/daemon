import { createEffect, createSignal } from "solid-js"
import { popUILayer, pushUILayer } from "../UILayerStore"
import { nanoid } from "nanoid"
import createTypewriter from "@/hooks/createTypewriter";

interface TextOverlayLine {
    text: string,
    color?: string,
    sideEffect?: () => void,
    //image?: string
}
export type TextOverlaySequence = TextOverlayLine[]

const TEXT_FADE_DURATION = 300;

export default function TextScene(props: {
    sequence: TextOverlayLine[],
    id?: string
}) {

    const [currentLine, setCurrentLine] = createSignal(0);
    const currentLineText = () => props.sequence[currentLine()]?.text ?? "";
    const {displayText, skipTypingAnimation, isFinished} = createTypewriter(currentLineText);

    let textElement!: HTMLParagraphElement // ref used to apply fade anim.

    createEffect(() => { // Handle end of sequence.
        if(currentLine() >= props.sequence.length) {
            console.log("AAAAA");
            props.id && popUILayer(props.id);
        }
    })

    let fadeLock = false; // Prevent triggering fade if it's already ongoing.
    function handleClick() {
        if(isFinished()) {
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
                    color: props.sequence[currentLine()]?.color,
                    "font-size": "32px",
                    "user-select": "none",
                    "padding": "20px"
                }}
            >
                {displayText()}
            </p>
        </div>
    )
}

export function playTextOverlay(sequence: TextOverlayLine[]) {
    const id = "text-scene" + nanoid();
    pushUILayer({
        id, 
        component: () => TextScene({sequence, id}),
        blockBehind: true,
    })
}