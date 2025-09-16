import { test, expect } from "vitest"
import { render } from "@solidjs/testing-library"
import userEvent from "@testing-library/user-event"
import Hermes from "@/features/hermes/Hermes"
import { createDialogueNode } from "@/core/dialogue/dialogueNode"
import sleep from "@/shared/utils/sleep"

const user = userEvent.setup()

test("hermes init test", async () => {
  const testTree = createDialogueNode("Root Node", "Root Name")
  const { container } = render(() => <Hermes root={testTree} />)
  const x = container.querySelector('.hermes-container')
  console.log(x)
  expect(x).toBeTruthy()
});

test("Root message appears on hermes init", async () => {
  const testTree = createDialogueNode("ROOT_TEXT", "Root Name");
  const {container} = render(() => <Hermes root={testTree}/>);
  const openingMessage = container.querySelector('.message-content');
  console.log(openingMessage);
  expect(openingMessage?.textContent).toBe("ROOT_TEXT")
});

test("Continue button advances to next message", async () => {
  const root = createDialogueNode("First", "A");
  root.addChild("Second").addChild("Third");
  const { container } = render(() => <Hermes root={root} />);
  // Initially shows first
  expect(container.querySelector('.message-content')?.textContent).toBe("First");
  // Click continue
  const nextBtn = container.querySelector<HTMLImageElement>('.hermes-next-prompt')!;
  expect(nextBtn).toBeTruthy();
  await user.click(nextBtn);
  // Now shows second
  expect(container.querySelectorAll('.message-content')[1]?.textContent).toBe("Second");
});

test("Options render and CAR flow shows call then response", async () => {
  const root = createDialogueNode("Root", "A");
  root.addCAROptionChild("Opt1", "CallMsg", "RespMsg");
  const { container } = render(() => <Hermes root={root} />);
  const firstOpt = container.querySelectorAll('.hermes-resp-container')[0] as HTMLElement;
  expect(firstOpt).toBeTruthy();
  // Click option -> call appears immediately
  await user.click(firstOpt);
  const messages = Array.from(container.querySelectorAll('.message-content p')).map(n => n.textContent);
  expect(messages).toContain("CallMsg");
  // Wait past CAR delay and expect response
  await sleep(1300);
  const messages2 = Array.from(container.querySelectorAll('.message-content p')).map(n => n.textContent);
  expect(messages2).toContain("RespMsg");
});

test("Option filtering with onlyShowWhen", async () => {
  const root = createDialogueNode("Root", "A");
  root.addChildAsOption("ShowMe", "full1", createDialogueNode("x","A"), undefined, { onlyShowWhen: (ctx) => ctx?.flags?.ok === true });
  root.addChildAsOption("HideMe", "full2", createDialogueNode("y","A"), undefined, { onlyShowWhen: () => false });
  const { container } = render(() => <Hermes root={root} ctx={{ flags: { ok: true } }} />);
  const optionTexts = Array.from(container.querySelectorAll('.hermes-resp-container p')).map(n => n.textContent);
  expect(optionTexts).toContain("ShowMe");
  expect(optionTexts).not.toContain("HideMe");
});

test("EMPTY_RENDER auto-advances to next node", async () => {
  const root = createDialogueNode("Visible", "A");
  const empty = root.addChild(""); // EMPTY_RENDER
  empty.addChild("After");
  const { container } = render(() => <Hermes root={root} />);
  // Click continue to traverse into EMPTY then auto-advance to After
  const nextBtn = container.querySelector<HTMLImageElement>('.hermes-next-prompt')!;
  await user.click(nextBtn);
  const texts = Array.from(container.querySelectorAll('.message-content p')).map(n => n.textContent);
  expect(texts).toContain("After");
});

test("Pagination renders for >3 options and switches page", async () => {
  const root = createDialogueNode("Root", "A");
  for (let i = 1; i <= 5; i++) {
    root.addChildAsOption(`Opt${i}`, `Full${i}`, createDialogueNode(`Msg${i}`, "A"));
  }
  const { container } = render(() => <Hermes root={root} />);
  const pageDots = container.querySelectorAll('.hermes-pages .hermes-page-opt');
  expect(pageDots.length).toBe(2); // 5 options -> 2 pages
  // First page shows first three options
  const page1Opts = Array.from(container.querySelectorAll('.hermes-resp-container p')).map(n => n.textContent);
  expect(page1Opts).toEqual(["Opt1","Opt2","Opt3"]);
  // Switch to second page
  await user.click(pageDots[1] as HTMLElement);
  const page2Opts = Array.from(container.querySelectorAll('.hermes-resp-container p')).map(n => n.textContent);
  expect(page2Opts).toEqual(["Opt4","Opt5", ""]); // third slot inactive
});

test("waitFor blocks progression and then shows options after resolve", async () => {
  let resolve!: () => void;
  const waitP = new Promise<void>(r => { resolve = r; });
  const root = createDialogueNode("Wait", "A").makeNodeWaitFor(async () => { await waitP; });
  root.addChildAsOption("After", "full", createDialogueNode("msg","A"));
  const { container } = render(() => <Hermes root={root} />);
  // No options shown yet during wait
  expect(container.querySelectorAll('.hermes-resp-container:not(.inactive)').length).toBe(0);
  // Resolve and expect options to appear
  resolve();
  // small tick to allow microtask flush
  await sleep(0);
  const opts = Array.from(container.querySelectorAll('.hermes-resp-container p')).map(n => n.textContent);
  expect(opts).toContain("After");
});
