import { createSignal, For } from "solid-js";
import './enoch-puzzle.css';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MOD = 26;

function lettersToNums(s: string): number[] {
    const out: number[] = [];
    for (const ch of s) {
        const idx = ALPHABET.indexOf(ch);
        if (idx === -1) throw new Error(`Invalid character: ${ch}`);
        out.push(idx);
    }
    return out;
}

function numsToLetters(nums: number[]): string {
    return nums.map((n) => ALPHABET[((n % MOD) + MOD) % MOD]).join("");
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

function hintEncodedIndependent(guessEnc: number[], targetEnc: number[]): string {
    let hint = "";
    for (let i = 0; i < guessEnc.length; i++) {
        const from = guessEnc[i];
        const to = targetEnc[i];

        // wrap-aware direction choice on a 26-cycle
        const forward = (to - from + MOD) % MOD;
        const backward = (from - to + MOD) % MOD;

        if (forward === 0) hint += "=";
        else if (forward <= backward) hint += "+";
        else hint += "-";
    }
    return hint;
}


export default function EnochPuzzle(props: { target: string }) {
    const targetPlainNums = () => lettersToNums(props.target);
    const targetEncodedNums = () => encodeCascading(targetPlainNums());

    const [guess, setGuess] = createSignal(new Array<number>(6).fill(0));
    const hint = () => hintEncodedIndependent(guess(), targetEncodedNums())

    const mod = (n: number) => ((n % MOD) + MOD) % MOD;

    const incGuessLetter = (idx: number) => {
        setGuess(prev => prev.map((letter, i) => i === idx ? mod(letter + 1) : letter));
    };

    const decGuessLetter = (idx: number) => {
        setGuess(prev => prev.map((letter, i) => i === idx ? mod(letter - 1) : letter));
    };

    return (
        <div class='enoch-puzzle'>
            <div class="enoch-guess">
                <For each={numsToLetters(guess()).split('')}>
                    {(ltr, idx) => (
                        <span class="guess-letter"
                             onClick={() => incGuessLetter(idx())}
                             onContextMenu={() => decGuessLetter(idx())}
                             onWheel={(e) => e.deltaY > 0 ? incGuessLetter(idx()) : decGuessLetter(idx())}
                        >
                            {ltr}
                        </span>
                    )}
                </For>
            </div>
            -&gt;
            {numsToLetters(decodeCascading(guess()))}
            {hint()}
        </div>
    )
}