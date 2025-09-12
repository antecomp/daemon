import { createSignal, createEffect, onCleanup } from "solid-js";
import { JSX } from "solid-js";

type ColoredChar = {
    char: string;
    color?: string;
}

export interface ColoredText {
    text: string;
    color?: string;
}

type TypewriterOptions = {
    delay?: number;
    onComplete?: () => void;
}

export default function createColorTypewriter(
    input: () => ColoredText[],
    { delay = 50, onComplete = () => {}}: TypewriterOptions = {}
) {
    const [displayText, setDisplayText] = createSignal<JSX.Element[]>([]);
    const [isFinished, setFinished] = createSignal(false);
    let callbackCalled = false;
    let interval: NodeJS.Timeout | null = null;

    // Flatten words into chars to add in easier.
    const flattenWords = (words: ColoredText[]): ColoredChar[] =>
        words.flatMap(({text: word, color}) =>
            [...word].map((char) => ({char, color}))
        );

    createEffect(() => {
        const words = input();
        const chars = flattenWords(words);

        // To reset on input change.
        setDisplayText([]);
        setFinished(false);
        callbackCalled = false;
        if (interval) clearInterval(interval);

        let index = 0;
        interval = setInterval(() => {
            if(index < chars.length) {
                setDisplayText((prev) => [
                    ...prev,
                    <span style={{color: chars[index].color ?? "white"}}>
                        {chars[index].char}
                    </span>
                ]);
                index++;
            } else {
                clearInterval(interval!);
                interval = null;
                if (!callbackCalled) {
                    callbackCalled = true;
                    setFinished(true);
                    onComplete();
                }
            }
        }, delay);
    })

    onCleanup(() => {
        if (interval) clearInterval(interval);
    });

    const skipTypingAnimation = () => {
        if (!isFinished()) {
            const chars = flattenWords(input());
            setDisplayText(
                chars.map(({ char, color }) => (
                    <span style={{ color: color ?? "inherit" }}>{char}</span>
                ))
            );
            setFinished(true);
            if (interval) clearInterval(interval);
            if (!callbackCalled) {
                callbackCalled = true;
                onComplete();
            }
        }
    };

    return { displayText, skipTypingAnimation, isFinished }
}