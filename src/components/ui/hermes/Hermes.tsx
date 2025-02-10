import "./hermes.css";
import { createSignal, For } from "solid-js";
import { DialogueNode, DialogueOption } from "@/core/dialogue/dialogueNode.types";
import { onMount } from "solid-js";
import MessageBox from "./MessageBox";
import { MessageBoxProps } from "./MessageBox";
import topb from "./assets/topb.png";
import midb from "./assets/midb.png";
import botb from "./assets/botb.png";
import ntwrk from "./assets/ntwrk.gif";
import nameplateBorder from "./assets/nameplate_border.png";
import { HERMES_MESSAGE_DELAY } from "./config";
import createTypewriter from "@/hooks/createTypewriter";
import { DialogueService } from "@/core/dialogue/dialogueManager";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));


// Do purposeful none reactive destructure of the root node to copy it?
// It doesn't matter since we're passing the getter result plain into here anyways...
// Just destructure for the sake of convenience.
export default function Hermes({root}: {root: DialogueNode}) {
  const [messages, setMessages] = createSignal<MessageBoxProps[]>([]);
  const addMessage = ({ name, text }: { name: string; text: string }) => {
    setMessages((prev) => [...prev, { name, text }]);
  };

  const [currentOptions, setCurrentOptions] = createSignal<DialogueOption[]>([]);
  const [currentOptionPage, setCurrentOptionPage] = createSignal(0); // to implement...
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
  const [hoveredOption, setHoveredOption] = createSignal("")
  const {displayText: optionPreviewText} = createTypewriter(hoveredOption)

  /** Advances dialogue based on the current node */
  async function advanceDialogue(node: DialogueNode) {
    addMessage({ name: node.name, text: (typeof node.render === 'string') ? node.render : node.render() });
    node.sideEffect && node.sideEffect();

    if (node.options.length > 0) {
      setCurrentOptions(node.options);
      // Stop here until an option is selected (option-select re-enters this recursion)
      return; 
    }

    if (node.next) {
    await sleep(HERMES_MESSAGE_DELAY); // Simulate a pause before advancing
      await advanceDialogue(node.next);
    } else {
        // Generate our own termination option.
        setCurrentOptions([{summaryText: "[END]", fullText: ""}]) 
    }
  }

  /** Handles when an option is picked */
  async function selectOption(option: DialogueOption) {
    setCurrentOptions([]); // Clear options
    setHoveredOption("") // Clear preview text
    if(option.next) {
        await advanceDialogue(option.next);
    } else {
        // Option has no next, terminate dialogue
        DialogueService.endDialogue();
    }
  }

  onMount(() => {
    //const root = generateDialogue(); // This will be given as a prop or by some atom later...
    advanceDialogue(root);
  });

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
        <img src={ntwrk} />
        <span>S-VLID:91ae0:ffc13 R-VLID:0000:0000</span>
        <span class="hermes-disconnect">DISCONNECT</span>
      </div>
      {
        (currentOptions().length > 3) &&
        <div classList={{
          "hermes-pages": true,
          "hp-first": (currentOptionPage() == 0),
          "hp-last": (currentOptionPage() == numPages() -1)
        }}>
          {generatePages()}
        </div>
      }
    </div>
  );
}