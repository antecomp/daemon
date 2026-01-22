import { createEffect, createSignal, JSX, onCleanup } from "solid-js";

/**
 * Flexible segment input:
 * - string: uncolored text
 * - [text, color]: tuple helper form, e.g. ["word", "tomato"]
 * - { text, color? }: legacy object form <- slated for removal.
 */
export type SegmentInput = string | [string, string] | {text: string, color?: string};

type TypewriterOptions = {
  delay?: number; // ms per character
  onComplete?: () => void;
};

type Segment = {
  text: string;
  color?: string;
};

/**
 * alias to ["text", "color"] format.
 */
export function color(text: string, color: string): [string, string] {
  return [text, color];
}

function normalize(input: SegmentInput[]): Segment[] {
  return input.map((seg) => {
    if (typeof seg === "string") {
      return { text: seg, color: undefined };
    }
    if (Array.isArray(seg)) {
      const [text, color] = seg;
      return { text, color };
    }
    return { text: seg.text, color: seg.color };
  });
}

/**
 * Create a typewriter animation for colored text segments.
 *
 * Performance
 * - Uses direct string slicing (ASCII-only assumption for slicing).
 * - Uses a single `shown` counter signal to drive updates.
 * - Avoids creating per-character elements; only updates span textContent.
 *
 * @param input Accessor returning an array of segments (string | [text,color] | {text,color?}).
 *              When this accessor changes, the animation restarts for the new content.
 * @param options.delay Milliseconds per character (default 50ms).
 * @param options.onComplete Callback invoked exactly once when typing finishes or is skipped.
 * @returns
 *  - display: JSX fragment to render the animated text.
 *  - skipTypingAnimation: reveals all remaining text and triggers onComplete if needed.
 *  - isFinished: accessor indicating whether the full text is visible.
 */
export default function createColorTypewriter(
  input: () => SegmentInput[],
  { delay = 50, onComplete = () => {} }: TypewriterOptions = {}
) {
  const [segments, setSegments] = createSignal<Segment[]>([]);
  const [totCharsShown, setTotCharsShown] = createSignal(0);
  const [isFinished, setFinished] = createSignal(false);

  let callbackCalled = false;
  let interval: number | null = null;
  let total = 0;

  const stop = () => {
    if (interval != null) {
      clearInterval(interval);
      interval = null;
    }
  };

  createEffect(() => { // triggers when input chages
    const segs = normalize(input());
    setSegments(segs);
    total = segs.reduce((acc, s) => acc + s.text.length, 0);

    stop();
    setTotCharsShown(0);
    setFinished(false);
    callbackCalled = false;

    if (total === 0) {
      setFinished(true);
      if (!callbackCalled) {
        callbackCalled = true;
        onComplete();
      }
      return;
    }

    interval = window.setInterval(() => {
      setTotCharsShown((prev) => {
        const next = prev + 1;
        if (next >= total) {
          stop();
          setFinished(true);
          if (!callbackCalled) {
            callbackCalled = true;
            onComplete();
          }
        }
        return Math.min(next, total);
      });
    }, delay);
  });

  onCleanup(stop);

  const skipTypingAnimation = () => {
    if (!isFinished()) {
      stop();
      setTotCharsShown(total);
      setFinished(true);
      if (!callbackCalled) {
        callbackCalled = true;
        onComplete();
      }
    }
  };

  const renderSegments = (withLineBreaks: boolean): JSX.Element => {
    let remaining = totCharsShown();
    const nodes: JSX.Element[] = [];

    segments().forEach((s) => {
      const take = Math.max(0, Math.min(remaining, s.text.length));
      remaining -= take;
      const text = take > 0 ? s.text.slice(0, take) : "";

      if (!withLineBreaks) {
        nodes.push(<span style={{ color: s.color ?? undefined }}>{text}</span>);
        return;
      }

      const parts = text.split("\n");
      parts.forEach((part, index) => {
        if (part) {
          nodes.push(<span style={{ color: s.color ?? undefined }}>{part}</span>);
        }
        if (index < parts.length - 1) {
          nodes.push(<br />);
        }
      });
    });

    return <>{nodes}</>;
  };

  const display = (): JSX.Element => renderSegments(false);
  const displayWithLineBreaks = (): JSX.Element => renderSegments(true);

  return { display, displayWithLineBreaks, skipTypingAnimation, isFinished };
}
