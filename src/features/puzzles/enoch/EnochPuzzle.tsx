import { createMemo, createSignal, For, Index } from "solid-js";
import './enoch-puzzle.css'
import { SparseRecord } from "@/shared/types/misc.types";
import CharCol from "./CharCol";

import guess_btn from './assets/decrypt button.png'
import atb_o from './assets/atb_open.png'
import atb_f from './assets/atb_filled.png'

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MOD = ALPHABET.length
const WORD_LENGTH = 6;
const MAX_GUESSES = 7;

enum RowHint {
  CORRECT,
  UP,
  DOWN
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

function getHints(guessEnc: number[], targetEnc: number[]): RowHint[] {
  const hint: RowHint[] = [];
  for (let i = 0; i < guessEnc.length; i++) {
    const from = guessEnc[i];
    const to = targetEnc[i];

    if (from === to) hint.push(RowHint.CORRECT);
    else if (to > from) hint.push(RowHint.DOWN);
    else hint.push(RowHint.UP);
  }
  return hint;
}

export default function EnochPuzzle(props: { target: string, onCorrect: () => void, onFail: () => void }) {
  const targetPlainNums = () => lettersToNums(props.target);
  const targetEncodedNums = () => encodeCascading(targetPlainNums());

  const [guess, setGuess] = createSignal(
    new Array<number>(WORD_LENGTH).fill(0).map(_ => Math.floor(Math.random() * MOD))
  );

  const decodedGuess = () => decodeCascading(guess())

  const [numGuesses, setNumGuesses] = createSignal(0);
  const [hintTable, setHintTable] = createSignal(
    Array.from({ length: WORD_LENGTH }, () => ({} as SparseRecord<number, RowHint>))
  );

  function commitGuess() {
    setNumGuesses(prev => prev + 1);
    const g = guess();
    const hint = getHints(g, targetEncodedNums());
    setHintTable(prevHintTable => {
      const newHintTable = prevHintTable.map((hintCol, idx) => {
        const guessedLttr = g[idx];
        const guessedLttrHint = hint[idx];
        return {
          ...hintCol,
          [guessedLttr]: guessedLttrHint
        }
      });

      if(newHintTable.every((column, i) => column[guess()[i]] == RowHint.CORRECT)) {
        props.onCorrect();
      } else if (numGuesses() >= MAX_GUESSES) {
        props.onFail();
      }

      return newHintTable;
    });
  }

  const incGuessLetter = (idx: number) => {
    setGuess(prev => prev.map((letter, i) => i === idx && letter < MOD - 1 ? letter + 1 : letter));
  };

  const decGuessLetter = (idx: number) => {
    setGuess(prev => prev.map((letter, i) => i === idx && letter > 0 ? letter - 1 : letter));
  };

  return (
    <div class="enoch-puzzle">
      <div class="enoch-spinners">
        {/* use Index over For, as there's some remounting issues */}
        <Index each={guess()}>
          {(gn, colPos) => {
            const hints = createMemo(() => hintTable()[colPos] ?? {});
            const hintedAlphabet = createMemo(() => {
              return ALPHABET.split("").map((lttr, lp) => {
                const hint = hints()[lp];
                if (hint === undefined) return <p>{lttr}</p> // No hint, base letter.
                if (hint === RowHint.CORRECT) return <p class='correct-lttr'>{lttr}</p> // letter correct.
                else return <p class='crctn'>{hint === RowHint.UP ? '▲' : '▼'}</p>
              })
            });

            return (
              <div
                class="char-column-container"
                onWheel={(e) => (hints()[gn()] != RowHint.CORRECT) && (e.deltaY > 0 ? decGuessLetter(colPos) : incGuessLetter(colPos))}
              >
                <button onClick={() => (hints()[gn()] != RowHint.CORRECT) && decGuessLetter(colPos)}>▲</button>
                <CharCol
                  els={hintedAlphabet()}
                  index={gn()}
                  class="enoch-col"
                  rowHeight={38}
                  windowSize={7}
                />
                <button onClick={() => (hints()[gn()] != RowHint.CORRECT) && incGuessLetter(colPos)}>▼</button>
              </div>
            );
          }}
        </Index>
      </div>
      <p class="decrypt-preview">
        <For each={guess()}>
          {
            (guessLetter, glI) => {
              return <span
                style={{ color: hintTable()[glI()][guessLetter] == RowHint.CORRECT ? 'lime' : 'white' }}
              >
                {ALPHABET[decodedGuess()[glI()]]}
              </span>
            }}
        </For>
      </p>
      <br />
      <div class="guess-counter">
        <For each={Array.from({ length: MAX_GUESSES }, (_, i) => i < numGuesses())}>
          {g => <img src={g ? atb_f : atb_o}>
          </img>}
        </For>
      </div>
      <img class="guess-button" src={guess_btn} onClick={commitGuess} />
    </div>
  );
}
