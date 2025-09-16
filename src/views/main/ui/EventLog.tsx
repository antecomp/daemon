import CornerRect from "@/components/util/corner-rect/CornerRect";
import br from "@/assets/ui/corners/da/br.png"
import tr from "@/assets/ui/corners/da/tr.png"
import tl_el from "../assets/tl_el.png"
import { createEffect, on, createSignal, For } from "solid-js";
import { LOGIN_MESSAGE } from "@/config/init";

const [logMessages, setLogMessages] = createSignal<{ id: number, text: string, color: string }[]>([
    {id: 0, text: LOGIN_MESSAGE, color: '#cfb886ff'}
]);
/**
 * Append a message to the "EventLog" which is the small text box at the bottom of the screen.
 * @param msg Message to append
 */
export const addLogMessage = (text: string, color = "#aaa") => {
    // Use date to force uniqueness.
    setLogMessages((prev) => [...prev.slice(-15), { id: Date.now(), text, color }]);
};

export default function EventLog() {
    let containerRef: HTMLParagraphElement | undefined;

    // Scrolljacking since default scroll distance on every tested web browser was too large, skipping over text.
    const handleWheel = (e: WheelEvent) => {
        if (containerRef) {
            e.preventDefault();
            containerRef.scrollTop += e.deltaY * 0.3;
        }
    }

    // Trigger scroll down when messages change (append)
    createEffect(
        on(logMessages, () => {
            if (containerRef) {
                containerRef.scrollTo({ top: containerRef.scrollHeight, behavior: "smooth" });
            };
        })
    );

    return (
        <CornerRect
            borderSize={2}
            borderType="solid white"
            corners={[tl_el, tr, undefined, br]}
            id="event-log"
        >
            <p class="inner" ref={containerRef} onwheel={handleWheel}>
                <For each={logMessages()}>
                    {(msg) => <p class="event-message" style={{ color: msg.color }}>{msg.text}</p>}
                </For>
            </p>
        </CornerRect>
    )
}