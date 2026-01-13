import { createMemo, createSignal, For, Index } from "solid-js";
import { CharColumn } from "./CharColumn";
import './enoch-puzzle.css'
import mod from "@/shared/utils/mod";
import { SparseRecord } from "@/shared/types/misc.types";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MOD = ALPHABET.length
const WORD_LENGTH = 6;

type hintChar = '▲' | '▼' | '='

function numsToLetters(nums: number[]): string {
  return nums.map((n) => ALPHABET[((n % MOD) + MOD) % MOD]).join("");
}

function lettersToNums(s: string): number[] {
  const out: number[] = [];
  for (const ch of s) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error(`Invalid character: ${ch}`);
    out.push(idx);
  }
  return out;
}

function encodeCascading(plain: number[]): number[] {
  if (plain.length === 0) return [];
  const cipher: number[] = new Array(plain.length);
  cipher[0] = ((plain[0] % MOD) + MOD) % MOD;
  for (let i = 1; i < plain.length; i++) {
    cipher[i] = (plain[i] + plain[i - 1]) % MOD;
  }
  return cipher;
}

function decodeCascading(cipher: number[]): number[] {
  if (cipher.length === 0) return [];
  const plain: number[] = new Array(cipher.length);
  plain[0] = ((cipher[0] % MOD) + MOD) % MOD;
  for (let i = 1; i < cipher.length; i++) {
    plain[i] = (cipher[i] - plain[i - 1] + MOD) % MOD;
  }
  return plain;
}

function getHints(guessEnc: number[], targetEnc: number[]): hintChar[] {
  const hint: hintChar[] = [];
  for (let i = 0; i < guessEnc.length; i++) {
    const from = guessEnc[i];
    const to = targetEnc[i];

    if (from === to) hint.push("=");
    else if (to > from) hint.push("▼");
    else hint.push("▲");
  }
  return hint;
}

export default function EnochPuzzle(props: { target: string }) {
  const targetPlainNums = () => lettersToNums(props.target);
  const targetEncodedNums = () => encodeCascading(targetPlainNums());

  const [guess, setGuess] = createSignal(new Array<number>(WORD_LENGTH).fill(12));

  const [numGuesses, setNumGuesses] = createSignal(0);
  const [hintTable, setHintTable] = createSignal(
    Array.from({ length: WORD_LENGTH }, () => ({} as SparseRecord<number, hintChar>))
  );

  function commitGuess() {
    setNumGuesses(prev => prev + 1);
    const g = guess();
    const hint = getHints(g, targetEncodedNums());
    setHintTable(prevHintTable => prevHintTable.map((hintCol, idx) => {
      const guessedLttr = g[idx];
      const guessedLttrHint = hint[idx];
      return {
        ...hintCol,
        [guessedLttr]: guessedLttrHint
      }
    }));
  }

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
          {(gn, colPos) => {
            const hints = createMemo(() => hintTable()[colPos] ?? {});
            const hintedAlphabet = createMemo(() => {
              const h = hints();
              // NOTE: keys in your hint objects are numbers-as-strings, but h[lp] works fine
              return ALPHABET.split("").map((lttr, lp) => h[lp] ?? lttr).join("");
            });

            return (
              <div
                class="char-column-container"
                onWheel={(e) => (e.deltaY > 0 ? decGuessLetter(colPos) : incGuessLetter(colPos))}
              >
                <button onClick={() => decGuessLetter(colPos)}>▲</button>
                <CharColumn
                  text={hintedAlphabet()}
                  index={gn()}
                  blank=""
                  class="enoch-col"
                  rowHeight={38}
                />
                <button onClick={() => incGuessLetter(colPos)}>▼</button>
              </div>
            );
          }}
        </Index>
      </div>
      {numGuesses()} &nbsp;
      {numsToLetters(decodeCascading(guess()))}
      <br />
      <button style={{border: 'solid white 1px', padding: '5px'}} onClick={commitGuess}>Commit Guess</button>
    </div>
  );
}
