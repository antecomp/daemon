import { createEffect, createSignal, JSX } from "solid-js"
import { popUILayer, pushUILayer } from "../UILayerStore"
import { nanoid } from "nanoid"
import createTypewriter from "@/hooks/createTypewriter";

interface TextSceneLine {
    text: string,
    color?: string,
    sideEffect?: () => void,
    //image?: string
}


export default function TextScene(props: {
    sequence: TextSceneLine[],
    id?: string
}) {

    const [currentLine, setCurrentLine] = createSignal(0);
    const currentLineText = () => props.sequence[currentLine()]?.text ?? "";
    const {displayText, skipTypingAnimation, isFinished} = createTypewriter(currentLineText);

    createEffect(() => { // Handle end of sequence.
        if(currentLine() >= props.sequence.length) {
            console.log("AAAAA");
            props.id && popUILayer(props.id);
        }
    })

    function handleClick() {
        if(isFinished()) {
            setCurrentLine(prev => prev + 1);
        } else {
            skipTypingAnimation();
        }
    }

    return (
        <p 
            onclick={handleClick}
            style={{
                color: props.sequence[currentLine()]?.color,
                "font-size": "32px",
                "user-select": "none",
                "padding": "20px"
            }}
        >
            {displayText()}
        </p>
    )
}

export function playTextScene(sequence: TextSceneLine[]) {
    const id = "text-scene" + nanoid();
    pushUILayer({
        id, 
        component: () => TextScene({sequence, id}),
        blockBehind: true,
        style: {
            background: "black",
            display: "flex",
            "justify-content": "center",
            "align-items": "center"
        }
    })
}