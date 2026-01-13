import { createSignal, For, Index } from "solid-js";
import { CharColumn } from "./CharColumn";
import './enoch-puzzle.css'
import mod from "@/shared/utils/mod";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MOD = ALPHABET.length

function numsToLetters(nums: number[]): string {
    return nums.map((n) => ALPHABET[((n % MOD) + MOD) % MOD]).join("");
}

export default function EnochPuzzle(props: { target: string }) {
  const [guess, setGuess] = createSignal(new Array<number>(6).fill(12));

  const incGuessLetter = (idx: number) => {
    //setGuess(prev => prev.map((letter, i) => i === idx ? mod(letter + 1, MOD) : letter));
    setGuess(prev => prev.map((letter, i) => i === idx && letter < MOD - 1 ? letter + 1 : letter));
  };

  const decGuessLetter = (idx: number) => {
    //setGuess(prev => prev.map((letter, i) => i === idx ? mod(letter - 1, MOD) : letter));
    setGuess(prev => prev.map((letter, i) => i === idx && letter > 0 ? letter - 1 : letter));
  };

  return (
    <div class="enoch-puzzle">
      <div class="enoch-spinners">
        <div class="enoch-spinner-label">&gt;</div>
        {/* use Index over For, as there's some remounting issues */}
        <Index each={guess()}>
          {(gn, colPos) =>
            <div class="char-column-container"
              onWheel={e => e.deltaY > 0 ? decGuessLetter(colPos) : incGuessLetter(colPos)}
            >
              <button onClick={() => decGuessLetter(colPos)}>u</button>
              <CharColumn
                text={ALPHABET}
                index={gn()}
                blank=""
                class="enoch-col"
                rowHeight={38}
              />
              <button onClick={() => incGuessLetter(colPos)}>d</button>
            </div>
          }
        </Index>
      </div>
      {numsToLetters(guess())}
    </div>
  );
}
