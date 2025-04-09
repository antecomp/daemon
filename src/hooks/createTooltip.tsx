import { createSignal, JSX, onCleanup, Show } from "solid-js";
import { Portal } from "solid-js/web";

const TOOLTIP_OFFSET = 15;

export function createTooltip() {
    const [tooltipContent, setTooltipContent] = createSignal<(() => JSX.Element) | null>(null);

    const [position, setPosition] = createSignal({ x: 0, y: 0 });

    let tooltipRef: HTMLDivElement | undefined;

    const updatePosition = (e: MouseEvent) => {
        if(!tooltipRef) return;

        let x = e.clientX + TOOLTIP_OFFSET;
        let y = e.clientY + TOOLTIP_OFFSET;

        const { width, height } = tooltipRef.getBoundingClientRect();

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Check if going beyond right boundary, if so, flip to left side
        if (x + width > windowWidth) {
            x = e.clientX - width - TOOLTIP_OFFSET;
        }

        // Check if going beyond bottom boundary, if so, flip to top side
        if (y + height > windowHeight) {
            y = e.clientY - height - TOOLTIP_OFFSET;
        }

        setPosition({ x, y });
    }

    const showTooltip = (content: () => JSX.Element) => {
        setTooltipContent(() => content);
        document.addEventListener("mousemove", updatePosition);
    }

    const hideTooltip = () => {
        setTooltipContent(null);
        document.removeEventListener("mousemove", updatePosition);
    }

    onCleanup(() => {
        document.removeEventListener("mousemove", updatePosition);
    })

    const TooltipComponent = () => (
        <Show when={tooltipContent()}>
            <Portal
                mount={document.body}
            >
                <div
                    ref={tooltipRef}
                    class="tooltip"
                    style={{
                        position: "fixed",
                        top: `${position().y}px`,
                        left: `${position().x}px`,
                        "z-index": 1000,
                        // Actual specific styling should be done in base.css
                    }}
                >
                    {tooltipContent?.()?.()}
                </div>
            </Portal>
        </Show>
    );

    return { showTooltip, hideTooltip, TooltipComponent };
}