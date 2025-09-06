import { createSignal, For, onCleanup } from "solid-js";
import { DialogueContext, DialogueNode, DialogueOption } from "@/core/dialogue/dialogueNode.types";
import { onMount } from "solid-js";
import MessageBox from "./MessageBox";
import { MessageBoxProps } from "./MessageBox";
import createTypewriter from "@/hooks/createTypewriter";
import { DialogueService } from "@/core/dialogue/dialogueService";
import sleep from "@/utils/sleep";
import { EMPTY_RENDER, evalDialogueNodeNext, isDialogueNodeEmpty } from "@/core/dialogue/dialogueNode";

import "./hermes.css";
import topb from "./assets/topb.png";
import midb from "./assets/midb.png";
import botb from "./assets/botb.png";
import ntwrk_gif from "./assets/ntwrk.gif";
import nameplateBorder from "./assets/nameplate_border.png";


//const HERMES_MESSAGE_DELAY = 1200;

// Reply beat for CAR after a player selects an option.
// [option select] -> send option message -> (wait CAR_DELAY_MS) -> send reply message.
const CAR_DELAY_MS = 1200;

/**
 * Hermes is the main UI component for visualizing and traversing dialogue graphs. 
 * Hermes is added as a UI layer by utilizing DialogueService.startDialogue
 * @see dialogueManager.tsx
 * @param root - The root node of the dialogue tree
 */
export default function Hermes(
  // Destructure out of laziness. All of this should be static anyways.
  { root, ctx }: { root: DialogueNode, ctx?: DialogueContext }
) {
  const [messages, setMessages] = createSignal<MessageBoxProps[]>([]);
  const addMessage = ({ name, text }: { name: string; text: string }) => setMessages((prev) => [...prev, { name, text }]);

  const [currentOptions, setCurrentOptions] = createSignal<DialogueOption[]>([]);
  const [currentOptionPage, setCurrentOptionPage] = createSignal(0);
  const optionsOffset = () => currentOptionPage() * 3;
  const numPages = () => Math.ceil(currentOptions().length / 3);

  // Helper function to generate pagination for options (little thingy on the side.)
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

  // Helper functions to extract and setup option stuff.
  function visibleOptionsOf(node: DialogueNode, ctx?: DialogueContext): DialogueOption[] {
    return node.options.filter(o => !o.onlyShowWhen || o.onlyShowWhen(ctx));
  }

  function showOptions(opts: DialogueOption[]) {
    setCurrentOptionPage(0);
    setCurrentOptions(opts);
    setCanClickNext(false);
    pendingNextNode = null;
  }


  // Next-button state. (This is for linear, non-empty nodes. I.e a chain of .nexts with no option)
  const [canClickNext, setCanClickNext] = createSignal(false);
  // caches the node to be rendered for when we click next.
  let pendingNextNode: DialogueNode | null = null;

  // Prevent continuation after unmmount
  let stopped = false;
  onCleanup(() => {stopped = true});

  // Da big traversal shieeeeeettttttt
  async function advanceDialogue(node: DialogueNode) {
    if (stopped) return;
    
    // Renda'
    const text = (typeof node.render === 'string') ? node.render : node.render()
    addMessage({ name: node.name, text});

    node.sideEffect && node.sideEffect(ctx);
    if (stopped) return; // Just in case the side effect does a close action lol.

    // waitFor overtakes progression, it is up to the dialogue writer to time things accordingly with the body of this.
    if(node.waitFor) {
      // while waiting, hide options/next
      setCurrentOptions([]);
      setCanClickNext(false);
      pendingNextNode = null;

      await node.waitFor(ctx);
      if (stopped) return;

      // Node has options...
      const options = visibleOptionsOf(node, ctx);
      if(options.length > 0) {
        showOptions(options)
        return;
      }

      // Node has next. We instantly and automatically run through this one.
      // Remember the timing should be handled by waitFors methid here!
      if(node.next) {
        const n = evalDialogueNodeNext(node.next, ctx)!;
        await advanceDialogue(n);
        return;
      }

      // Otherwise autogen terminator for leaf...
      setCurrentOptions([{ summaryText: "[END]", fullText: "" }]);

      return;
    }

    // Options
    const options = visibleOptionsOf(node, ctx);
    if (options.length > 0) {
      showOptions(options);
      return;
    }

    // Next flow.
    if (node.next) {
      const next = evalDialogueNodeNext(node.next, ctx)!;

      // EMPTY_RENDER nodes auto-advance.
      if (isDialogueNodeEmpty(node)) {
        await advanceDialogue(next);
        return;
      }

      // Click to advance...
      setCurrentOptions([]);
      pendingNextNode = next;
      setCanClickNext(true);
      return;
    }

    // Fallback (leaf), generate terminator option.
    setCurrentOptions([{ summaryText: "[END]", fullText: "" }]);
  }

  async function selectOption(option: DialogueOption) {
    if(stopped) return;

    // Clear/Reset.
    setCurrentOptions([]); 
    setHoveredOption("") 
    setCurrentOptionPage(0);

    option.sideEffect?.(ctx);
    if(stopped) return;

    // Termination Option -> kill this dialogue NOW.
    if (!option.next) {
      if(!stopped) DialogueService.endDialogue();
      return;
    }

    // Option next is an EMPTY_RENDER, auto-advance (for chaining options without sending messages)
    // TODO/WARNING we're skipping the case of option.next(ctx) => EMPTY_RENDER for now...
    // Generally I don't think we should ever have a case like that, as it introduces some weird unreliable behavior.
    if(typeof option.next == 'object' && isDialogueNodeEmpty(option.next)) {
      await advanceDialogue(option.next)
      return;
    }

    // CaR handler. (Show option message, sleep, show response node, advance from there.)
    // Render Call Right Away.
    const call = evalDialogueNodeNext(option.next, ctx)!
    const text = (typeof call.render === 'string') ? call.render : call.render()
    addMessage({ name: call.name, text});

    // Reply "beat" (delay)
    await sleep(CAR_DELAY_MS);
    if(stopped) return; // closure during sleep.

    const response = evalDialogueNodeNext(call.next, ctx)
    if (!response) { // Only call but no response!
      console.error('[Dialogue Early Termination] Option had a next, but this next goes nowhere!')
      //if(!stopped) DialogueService.endDialogue();
      setCurrentOptions([{ summaryText: "[END]", fullText: "" }]);
      return;
    }

    // Retvrn to normal evaluation with response onwards...
    await advanceDialogue(response!)
  }

  async function handleClickNext() {
    if (!canClickNext() || stopped) return;
    setCanClickNext(false);
    const n = pendingNextNode;
    pendingNextNode = null;
    if (n) await advanceDialogue(n);
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

      <button
        class="debug-next-button"
        disabled={!canClickNext()}
        onClick={handleClickNext}
      >
        Next.
      </button>
    </div>
  );
}