import { createSignal, JSX, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { TOOLTIP_OFFSET } from "@/config/ui.config";

// helper: robust scale even across zoom / transforms
function getElementScale(el: HTMLElement) {
  // offsetWidth is layout size in CSS px (unscaled)
  // getBoundingClientRect().width is the *rendered* size (after zoom/transform)
  const rect = el.getBoundingClientRect();
  const ow = el.offsetWidth || 1; // avoid div-by-zero
  return rect.width / ow;
}

export function createTooltip() {
  const [tooltipContent, setTooltipContent] = createSignal<(() => JSX.Element) | null>(null);
  const [position, setPosition] = createSignal({ x: 0, y: 0 });

  let tooltipRef: HTMLDivElement | undefined;

  const overlay = () => document.getElementById("modal-root") as HTMLDivElement | null;
  const gameRoot = () => document.getElementById("game-root") as HTMLElement | null;

  const updatePosition = (e: MouseEvent) => {
    const root = gameRoot();
    const layer = overlay();
    if (!tooltipRef || !root || !layer) return;

    const rect = root.getBoundingClientRect();
    const scale = getElementScale(root);          // works for both `zoom` and `transform: scale`
    const localX = (e.clientX - rect.left) / scale;
    const localY = (e.clientY - rect.top)  / scale;

    let x = localX + TOOLTIP_OFFSET;
    let y = localY + TOOLTIP_OFFSET;

    // tooltip’s intrinsic (unscaled) size:
    const w = tooltipRef.offsetWidth;
    const h = tooltipRef.offsetHeight;

    // visible area in local (unscaled) coords:
    const visibleW = rect.width  / scale;
    const visibleH = rect.height / scale;

    // flip if overflowing right/bottom
    if (x + w > visibleW) x = localX - w - TOOLTIP_OFFSET;
    if (y + h > visibleH) y = localY - h - TOOLTIP_OFFSET;

    // clamp left/top too
    if (x < 0) x = 0;
    if (y < 0) y = 0;

    setPosition({ x, y });
  };

  const showTooltip = (content: () => JSX.Element) => {
    setTooltipContent(() => content);
    document.addEventListener("mousemove", updatePosition);
  };

  const hideTooltip = () => {
    setTooltipContent(null);
    document.removeEventListener("mousemove", updatePosition);
  };

  onCleanup(() => document.removeEventListener("mousemove", updatePosition));

  const TooltipComponent = () => (
    <Show when={tooltipContent()}>
      <Portal mount={overlay() ?? undefined}>
        <div
          ref={tooltipRef}
          class="tooltip"
          style={{
            top: `${position().y}px`,
            left: `${position().x}px`,
          }}
        >
          {tooltipContent?.()?.()}
        </div>
      </Portal>
    </Show>
  );

  return { showTooltip, hideTooltip, TooltipComponent };
}