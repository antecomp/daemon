import { onMount } from "solid-js";
import dogtagFirst from "./assets/dogtag_first.png";
import dogtagLast from "./assets/dogtag_last.png";

export interface MessageBoxProps {
    name: string;
    text: string | (() => string);
  }

  /**
   * Simple helper component for Hermes, renders out individual messages/nodes within the dialogue tree.
   * @param name: Whos speaking ("dogtag"). Set this to "VISUALIZER" if you want to instead have a /me-like gray action box.
   * @param text: The content of the message (string or a function that returns a string)
   * @returns 
   */
export default function MessageBox (props: MessageBoxProps) {
  let ref: HTMLDivElement | undefined;

  onMount(() => {
    ref && ref.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  if(props.text === "") return;

  if(props.name === "VISUALIZER") return (
    <div class="visualizer-body message-body" ref={ref}>
        <p>{typeof props.text === "string" ? props.text : props.text()}</p>
    </div>
  )

  return (
    <div class="message-body" ref={ref}>
      <div class="message-dogtag">
        <img src={dogtagFirst} />
        <span>{props.name}</span>
        <img src={dogtagLast} />
      </div>
      <div class="message-content">
        <p>{typeof props.text === "string" ? props.text : props.text()}</p>
      </div>
    </div>
  );
};