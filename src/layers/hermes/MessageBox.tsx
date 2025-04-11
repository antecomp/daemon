import { onMount } from "solid-js";
import dogtag_first from "./assets/dogtag_first.png";
import dogtag_last from "./assets/dogtag_last.png";

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

  if(props.text === "") return; // Add nothing if no message text provided (can be used for traversal-only dialogue nodes/chaining)

  if(props.name === "VISUALIZER") return (
    <div class="visualizer-body message-body" ref={ref}>
        <p>{typeof props.text === "string" ? props.text : props.text()}</p>
    </div>
  )

  return (
    <div class="message-body" ref={ref}>
      <div class="message-dogtag">
        <img src={dogtag_first} />
        <span>{props.name}</span>
        <img src={dogtag_last} />
      </div>
      <div class="message-content">
        <p>{typeof props.text === "string" ? props.text : props.text()}</p>
      </div>
    </div>
  );
};