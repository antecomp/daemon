import { createSignal } from "solid-js";
import CharColumn from "./CharColumn";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function EnochPuzzle(props: {target: string}) {
  const [idx, setIdx] = createSignal(0);

  return (
    <>
      <CharColumn
        text={ALPHABET}
        index={idx}
        setIndex={setIdx}
      />
      <p>
        logical index: {idx()} / char: {text[idx()]}
      </p>
    </>
  );
}
