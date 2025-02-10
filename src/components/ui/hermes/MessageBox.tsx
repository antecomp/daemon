import { onMount } from "solid-js";
import dogtagFirst from "./assets/dogtag_first.png";
import dogtagLast from "./assets/dogtag_last.png";

export interface MessageBoxProps {
    name: string;
    text: string | (() => string);
  }

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