import clamp from '@/shared/utils/clamp';
import { createEffect, createSignal, For, JSX } from 'solid-js'

export default function CharCol(props: {
    els: JSX.Element[],
    index: number; // Which part we're currently at.

    rowHeight?: number
    blank?: JSX.Element
    durationMs?: number
    easing?: string
    class?: string
    rowClass?: string
}) {
    const rowHeight = () => props.rowHeight ?? 28;
    const blank = props.blank ?? (<></>);
    const durationMs = () => props.durationMs ?? 180;
    const easing = () => props.easing ?? "cubic-bezier(0.2, 0.8, 0.2, 1)";

    // Clamp index
    const safeIndex = () => {
        const len = props.els.length;
        if (len <= 0) return 0;
        return clamp(props.index, 0, len - 1);
    }

    // Padded strip
    // TODO: Change to arbitrary padding
    const strip = () => [blank, blank, ...props.els, blank, blank];

    // translateY
    const [y, setY] = createSignal(0);

    // Update translation whenever input info changes;
    // TODO: Change for arbitrary padding & window size.
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

    return (
        <div
            class={props.class}
            style={{
                position: 'relative',
                overflow: 'hidden',
                height: `${rowHeight() * 5}px` // change to arb amount later
            }}
        >
            <div
                style={{
                    transform: `translateY(${y()}px)`,
                    transition: `transform ${durationMs()}ms ${easing()}`,
                    'will-change': 'transform'
                }}
            >
                <For each={strip()}>
                    {(s) =>
                        <div
                            class={props.rowClass}
                            style={{
                                height: `${rowHeight()}px`,
                                display: 'flex',
                                'align-items': 'center',
                                'justify-content': 'center',
                                'user-select': 'none',
                                // To have empty space with empty components
                                'white-space': 'pre'
                            }}
                        >
                            {s}
                        </div>
                        }
                </For>
            </div>

        </div>
    )
}