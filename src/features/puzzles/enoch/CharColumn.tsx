import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";

function clamp(n: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, n));
}

export function CharColumn(props: {
    text: string;
    index: number;                 // which character should be centered
    rowHeight?: number;            // px
    blank?: string;                // what to show when out of range (default: "")
    durationMs?: number;           // animation duration
    easing?: string;               // CSS easing function
    class?: string;                // wrapper class
    rowClass?: string;             // each row class
}
) {
    const rowHeight = () => props.rowHeight ?? 28;
    const blank = () => props.blank ?? "";
    const durationMs = () => props.durationMs ?? 180;
    const easing = () => props.easing ?? "cubic-bezier(0.2, 0.8, 0.2, 1)";

    // Clamp index so we never request outside the string.
    const safeIndex = createMemo(() => {
        const len = props.text.length;
        if (len <= 0) return 0;
        return clamp(props.index, 0, len - 1);
    });

    // We render a finite strip that is long enough to animate between indices.
    // Strip indices range from -2 .. (len-1)+2, so blanks naturally appear.
    const strip = createMemo(() => {
        const len = props.text.length;
        const out: { i: number; ch: string }[] = [];
        for (let i = -2; i <= len - 1 + 2; i++) {
            const ch = i < 0 || i >= len ? blank() : props.text[i];
            out.push({ i, ch });
        }
        return out;
    });

    // Current translateY of the strip.
    const [y, setY] = createSignal(0);

    // Initialize + update translation whenever index/text changes.
    createEffect(() => {
        const centerI = safeIndex();
        // center row should show character at centerI, but our strip starts at -2.
        // The row for logical index `centerI` sits at position (centerI - (-2)) rows down in strip.
        const stripStart = -2;
        const rowPos = centerI - stripStart; // row number inside strip
        // We want that row to sit at window center, which is row #2 (0-based) in 5 rows.
        const windowCenterRow = 2;
        const targetY = -(rowPos - windowCenterRow) * rowHeight();
        setY(targetY);
    });

    // Optional: respect reduced motion
    const [reduceMotion, setReduceMotion] = createSignal(false);
    createEffect(() => {
        const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
        if (!mq) return;
        const onChange = () => setReduceMotion(mq.matches);
        onChange();
        mq.addEventListener?.("change", onChange);
        onCleanup(() => mq.removeEventListener?.("change", onChange));
    });

    return (
        <div
            class={props.class}
            style={{
                position: "relative",
                overflow: "hidden",
                height: `${rowHeight() * 5}px`,
            }}
            aria-label="Character window"
        >
            {/* Optional: a subtle marker for the center line */}
            <div
                style={{
                    position: "absolute",
                    left: "0",
                    right: "0",
                    top: `${rowHeight() * 2}px`,
                    height: `${rowHeight()}px`,
                    "pointer-events": "none",
                    // remove these if you don't want any highlight
                    // "background": "rgba(255,255,255,0.04)",
                }}
            />

            <div
                style={{
                    transform: `translateY(${y()}px)`,
                    transition: reduceMotion()
                        ? "none"
                        : `transform ${durationMs()}ms ${easing()}`,
                    "will-change": "transform",
                }}
            >
                {strip().map((row) => (
                    <div
                        class={props.rowClass}
                        style={{
                            height: `${rowHeight()}px`,
                            display: "flex",
                            "align-items": "center",
                            "justify-content": "center",
                            "user-select": "none",
                            // make blank rows keep spacing even if blank=""
                            "white-space": "pre",
                        }}
                    >
                        {row.ch === "" ? " " : row.ch}
                    </div>
                ))}
            </div>
        </div>
    );
}
