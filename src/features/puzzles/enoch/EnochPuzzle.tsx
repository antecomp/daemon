import { createMemo, createSignal, For, Index } from "solid-js";
import './enoch-puzzle.css'
import { SparseRecord } from "@/shared/types/misc.types";
import CharCol from "./CharCol";

import guess_btn from './assets/decrypt button.png'
import atb_o from './assets/atb_open.png'
import atb_f from './assets/atb_filled.png'
import atb_label from './assets/atb_label.png';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MOD = ALPHABET.length
const WORD_LENGTH = 6;
const MAX_GUESSES = 6;
const ALPHABET_CHARS = ALPHABET.split("");

enum RowHint {
  CORRECT,
  UP,
  DOWN
}

type ColumnState = {
  guess: number;
  hints: SparseRecord<number, RowHint>;
};

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

function createInitialColumns(length: number): ColumnState[] {
  return Array.from({ length }, () => ({
    guess: Math.floor(Math.random() * MOD),
    hints: {}
  }));
}

function isColumnCorrect(column: ColumnState): boolean {
  return column.hints[column.guess] === RowHint.CORRECT;
}

function EnochColumn(props:
  {
    column: () => ColumnState;
    colIndex: number;
    onInc: (idx: number) => void;
    onDec: (idx: number) => void;
  }
) {
  const isLocked = createMemo(() => isColumnCorrect(props.column()));
  const hintedAlphabet = createMemo(() => {
    const hints = props.column().hints ?? {};
    return ALPHABET_CHARS.map((lttr, lp) => {
      const hint = hints[lp];
      if (hint === undefined) return <p>{lttr}</p> // No hint, base letter.
      if (hint === RowHint.CORRECT) return <p class='correct-lttr'>{lttr}</p> // letter correct.
      return <p class='crctn'>{hint === RowHint.UP ? '▲' : '▼'}</p>
    })
  });

  return (
    <div
      class="char-column-container"
      onWheel={(e) => !isLocked() && (e.deltaY > 0 ? props.onDec(props.colIndex) : props.onInc(props.colIndex))}
    >
      <button onClick={() => !isLocked() && props.onDec(props.colIndex)}>▲</button>
      <CharCol
        els={hintedAlphabet()}
        index={props.column().guess}
        class="enoch-col"
        rowHeight={38}
        windowSize={7}
      />
      <button onClick={() => !isLocked() && props.onInc(props.colIndex)}>▼</button>
    </div>
  );
}

export default function EnochPuzzle(props: { target: string, onCorrect: () => void, onFail: () => void }) {
  const targetPlainNums = createMemo(() => lettersToNums(props.target));
  const targetEncodedNums = createMemo(() => encodeCascading(targetPlainNums()));

  const [columns, setColumns] = createSignal<ColumnState[]>(
    createInitialColumns(WORD_LENGTH)
  );
  const guessNums = createMemo(() => columns().map(column => column.guess));
  const decodedGuess = createMemo(() => decodeCascading(guessNums()));

  const [numGuesses, setNumGuesses] = createSignal(0);

  function commitGuess() {
    const g = guessNums();
    const hint = getHints(g, targetEncodedNums());
    const nextColumns = columns().map((column, idx) => ({
      ...column,
      hints: {
        ...column.hints,
        [g[idx]]: hint[idx]
      }
    }));
    const nextNumGuesses = numGuesses() + 1;

    setColumns(nextColumns);
    setNumGuesses(nextNumGuesses);

    if (nextColumns.every(isColumnCorrect)) {
      props.onCorrect();
    } else if (nextNumGuesses >= MAX_GUESSES) {
      props.onFail();
    }
  }

  const incGuessLetter = (idx: number) => {
    setColumns(prev => prev.map((column, i) => {
      if (i !== idx || column.guess >= MOD - 1) return column;
      return { ...column, guess: column.guess + 1 };
    }));
  };

  const decGuessLetter = (idx: number) => {
    setColumns(prev => prev.map((column, i) => {
      if (i !== idx || column.guess <= 0) return column;
      return { ...column, guess: column.guess - 1 };
    }));
  };

  return (
    <div class="enoch-puzzle">
      <div class="enoch-spinners">
        {/* use Index over For, as there's some remounting issues */}
        <Index each={columns()}>
          {(column, colPos) => (
            <EnochColumn
              column={column}
              colIndex={colPos}
              onDec={decGuessLetter}
              onInc={incGuessLetter}
            />
          )}
        </Index>
      </div>
      <p class="decrypt-preview">
        <For each={columns()}>
          {
            (column, glI) => {
              return <span
                style={{ color: isColumnCorrect(column) ? 'lime' : 'white' }}
              >
                {ALPHABET[decodedGuess()[glI()]]}
              </span>
            }}
        </For>
      </p>
      <br />
      <div class="guess-counter">
        <img src={atb_label} />
        <div>
          <For each={Array.from({ length: MAX_GUESSES }, (_, i) => i < numGuesses())}>
            {g => <img src={g ? atb_f : atb_o}>
            </img>}
          </For>
        </div>
      </div>
      <img class="guess-button" src={guess_btn} onClick={commitGuess} />
    </div>
  );
}
