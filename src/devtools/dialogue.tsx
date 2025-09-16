import { render } from "solid-js/web";
import DialogueVisualizer from "./DialogueVisualizer";

const root = document.getElementById("dialogue-app");
if (root) render(() => <DialogueVisualizer />, root);