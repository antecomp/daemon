import { createSignal, For } from "solid-js";
import { DialogueContext, DialogueNode, DialogueOption } from "@/core/dialogue/dialogueNode.types";
import { onMount } from "solid-js";
import MessageBox from "./MessageBox";
import { MessageBoxProps } from "./MessageBox";
import createTypewriter from "@/hooks/createTypewriter";
import { DialogueService } from "@/core/dialogue/dialogueService";
import sleep from "@/utils/sleep";
import { evalDialogueNodeNext } from "@/core/dialogue/dialogueNode";

import "./hermes.css";
import topb from "./assets/topb.png";
import midb from "./assets/midb.png";
import botb from "./assets/botb.png";
import ntwrk_gif from "./assets/ntwrk.gif";
import nameplateBorder from "./assets/nameplate_border.png";


const HERMES_MESSAGE_DELAY = 1200;

/**
 * Hermes is the main UI component for visualizing and traversing dialogue graphs. 
 * Hermes is added as a UI layer by utilizing DialogueService.startDialogue
 * @see dialogueManager.tsx
 * @param root - The root node of the dialogue tree
 */
export default function Hermes({ root, ctx }: { root: DialogueNode, ctx?: DialogueContext }) {
  // non-reactive destructure done here out of convenience, we're instantiating the signal on input anyway
  const [messages, setMessages] = createSignal<MessageBoxProps[]>([]);
  const addMessage = ({ name, text }: { name: string; text: string }) => {
    setMessages((prev) => [...prev, { name, text }]);
  };

  const [currentOptions, setCurrentOptions] = createSignal<DialogueOption[]>([]);
  const [currentOptionPage, setCurrentOptionPage] = createSignal(0);
  const optionsOffset = () => currentOptionPage() * 3;
  const numPages = () => Math.ceil(currentOptions().length / 3);

  const generatePages = () =>
    Array.from({ length: numPages() }, (_, i) => (
      <a
        class={`hermes-page-opt ${currentOptionPage() === i ? 'hpo-active' : ''}`}
        onClick={() => setCurrentOptionPage(i)}
      ></a>
  ));


  // Preview message for hovered option.
  const [hoveredOption, setHoveredOption] = createSignal("");
  const { displayText: optionPreviewText } = createTypewriter(hoveredOption);

  /** Advances dialogue based on the current node */
  async function advanceDialogue(node: DialogueNode) {
    addMessage({ name: node.name, text: (typeof node.render === 'string') ? node.render : node.render() });
    node.sideEffect && node.sideEffect(ctx);

    await node.waitFor?.(ctx);

    // Potential Logic Error? Not sure - What happens if we terminate dialogue mid waitfor?

    // Real-time check of if we should show the options or  not.
    const filteredOptions = node.options.filter(option => !option.onlyShowWhen || option.onlyShowWhen(ctx));

    if (filteredOptions.length > 0) {
      setCurrentOptions(filteredOptions);
      // Stop here until an option is selected (option-select re-enters this recursion)
      return;
    }

    if (node.next) {
      await sleep(HERMES_MESSAGE_DELAY * (1 + Math.random() / 2)); // Simulate a pause before advancing (TODO: should I add some randomness here?)
      await advanceDialogue(evalDialogueNodeNext(node.next, ctx)!);
    } else {
      // Generate our own termination option.
      setCurrentOptions([{ summaryText: "[END]", fullText: "" }])
    }
  }

  async function selectOption(option: DialogueOption) {
    setCurrentOptions([]); // Clear options
    setHoveredOption("") // Clear preview text
    option.sideEffect?.(ctx);
    if (option.next) {
      await advanceDialogue(evalDialogueNodeNext(option.next, ctx)!);
    } else {
      // Option has no next, terminate dialogue
      DialogueService.endDialogue();
    }
  }

  onMount(() => {
    advanceDialogue(root);
  })

  return (
    <div class="hermes-container">
      <div class="messages-container">
        <div class="message-spacer-nightmare"></div>
        <For each={messages()}>{(message) => <MessageBox {...message} />}</For>
      </div>
      <div class={`sender-container ${currentOptions().length > 0 ? "" : "inactive"}`}>
        <div class="text-preview">
          <img src={nameplateBorder} alt="" />
          <span class="name">Arda</span>
          {optionPreviewText()}
        </div>
        {[0, 1, 2].map((index) => {
          const option = currentOptions()[optionsOffset() + index];
          return (
            <div
              class={"hermes-resp-container " + (option ? "" : "inactive")}
              onClick={() => option && selectOption(option)}
              onMouseOver={() => option && setHoveredOption(option.fullText)}
            >
              <p>{option?.summaryText ?? ""}</p>
              <span></span>
              <img src={[topb, midb, botb][index]} alt="" />
            </div>
          );
        })}
      </div>
      <div class="hermes-footer">
        <span>S-VLID:91ae0:ffc13</span>
        <span>R-VLID:0000:0000</span>
        <img src={ntwrk_gif} />
      </div>
      {
        (currentOptions().length > 3) &&
        <div classList={{
          "hermes-pages": true,
          "hp-first": (currentOptionPage() == 0),
          "hp-last": (currentOptionPage() == numPages() - 1)
        }}>
          {generatePages()}
        </div>
      }
    </div>
  );
}