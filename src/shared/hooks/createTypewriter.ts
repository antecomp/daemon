import { createSignal, createEffect, onCleanup } from "solid-js";

/**
 * Typewriter effect for progressively revealing text.
 *
 * @param inputText The text to type out. Animation automatically triggers when this changes.
 * @param delay Delay between each character (in ms)
 * @param onComplete Callback function when typing completes
 * @returns displayText - Signal holding the current typed string
 * @returns skipTypingAnimation - Function to instantly complete the typing animation
 * @returns isFinished - Signal indicating if typing has finished
 */
export default function createTypewriter(inputText: () => string, delay = 50, onComplete = () => {}) {
    const [displayText, setDisplayText] = createSignal("");
    const [isFinished, setFinished] = createSignal(false);
    let callbackCalled = false;
    let interval: NodeJS.Timeout | null = null;

    createEffect(() => {
        const text = inputText(); // Get latest value from signal
        setDisplayText(""); // Reset display on text change
        setFinished(false);
        callbackCalled = false;

        if (interval) clearInterval(interval);

        interval = setInterval(() => {
            if (displayText().length < text.length) {
                setDisplayText((prev) => prev + text.charAt(prev.length));
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

        onCleanup(() => {
            if (interval) clearInterval(interval);
        });
    });

    const skipTypingAnimation = () => {
        if (!isFinished()) {
            setDisplayText(inputText());
            setFinished(true);
            if (!callbackCalled) {
                callbackCalled = true;
                onComplete();
            }
        }
    };

    return { displayText, skipTypingAnimation, isFinished };
}
