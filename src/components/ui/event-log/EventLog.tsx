import CornerRect from '@/components/util/corner-rect/CornerRect';
import tr from '@/assets/ui/corners/d1/tr.png'
import br from '@/assets/ui/corners/d1/br.png'
import pissbot from '@/assets/ui/corners/special/pissbot.png'
import { createEffect, createSignal, For, on } from "solid-js";
import './event-log.css'

const [logMessages, setLogMessages] = createSignal<{ id: number, text: string, color: string }[]>([]);

/**
 * Append a message to the "EventLog" which is the small text box at the bottom of the screen.
 * @param msg Message to append
 */
export const addLogMessage = (msg: string, color?: string) => {
  // Use date to force uniqueness.
  setLogMessages((prev) => [...prev.slice(-15), { id: Date.now(), text: msg, color: color ?? '#aaa' }]);
};

/**
 * Textbox at the bottom of the Main UI, under the scene. Used to convey game events or other short bits of info.
 * Text can be appended to this from anywhere using the addLogMessage method.
 */
export default function EventLog() {
  let containerRef: HTMLParagraphElement | undefined;

  createEffect(
    // Trigger scroll down when messages change (append)
    on(logMessages, () => {
      if(containerRef) {
        containerRef.scrollTo({ top: containerRef.scrollHeight, behavior: "smooth" });
      };
    })
  )

  // Little greeting message for demo. Remove later.
  setTimeout(() => {
    addLogMessage('Welcome to daemon.garden', 'teal')
  }, 50)

  /* HEY REDDIT - IF YOU DONT WANT PEOPLE SCROLLJACKING. MAYBE PROVIDE AN ALTERNATIVE 🖕 */
  const handleWheel = (e: WheelEvent) => {
    if(containerRef) {
      e.preventDefault();
      containerRef.scrollTop += e.deltaY * 0.3;
    }
  }

    return (
      <CornerRect borderSize={3} borderType="double white" corners={[pissbot, tr, undefined, br]} style={{width: 'inherit', height: 'inherit'}} id="event-log">
        <p class="inner" ref={containerRef} onwheel={handleWheel}>
          <For each={logMessages()}>
            {(msg) => <p class="event-message" style={{color: msg.color}}>{msg.text}</p>}
          </For>
        </p>
      </CornerRect>
    )
}