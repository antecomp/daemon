// cascading-cli.ts
import * as readline from "readline";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const MOD = 26;

// ---------- mapping (no ASCII math) ----------
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

// ---------- cascading cipher ----------
// cipher[0] = plain[0]
// cipher[i] = (plain[i] + plain[i-1]) mod 26
function encodeCascading(plain: number[]): number[] {
  if (plain.length === 0) return [];
  const cipher: number[] = new Array(plain.length);
  cipher[0] = ((plain[0] % MOD) + MOD) % MOD;
  for (let i = 1; i < plain.length; i++) {
    cipher[i] = (plain[i] + plain[i - 1]) % MOD;
  }
  return cipher;
}

// plain[0] = cipher[0]
// plain[i] = (cipher[i] - plain[i-1]) mod 26
function decodeCascading(cipher: number[]): number[] {
  if (cipher.length === 0) return [];
  const plain: number[] = new Array(cipher.length);
  plain[0] = ((cipher[0] % MOD) + MOD) % MOD;
  for (let i = 1; i < cipher.length; i++) {
    plain[i] = (cipher[i] - plain[i - 1] + MOD) % MOD;
  }
  return plain;
}

// ---------- independent hint (compare ENCODED guess to target ENCODED) ----------
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

// ---------- hidden target plaintext (6 letters) ----------
const TARGET_PLAIN = "RAVENS"; // <-- change this to your hidden message
const TARGET_PLAIN_NUMS = lettersToNums(TARGET_PLAIN);

// Expected encoded phrase for that target plaintext
const TARGET_ENC_NUMS = encodeCascading(TARGET_PLAIN_NUMS);
const TARGET_ENC_TEXT = numsToLetters(TARGET_ENC_NUMS);

// ---------- CLI ----------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function isValidSixLetters(s: string): boolean {
  if (s.length !== 6) return false;
  for (const ch of s) if (ALPHABET.indexOf(ch) === -1) return false;
  return true;
}

function ask(): void {
  rl.question("Enter a 6-letter ENCODED string: ", (raw) => {
    const guessEncText = raw.trim().toUpperCase();

    if (!isValidSixLetters(guessEncText)) {
      console.log("Please enter exactly 6 letters A–Z.\n");
      return ask();
    }

    const guessEncNums = lettersToNums(guessEncText);
    const decodedNums = decodeCascading(guessEncNums);
    const decodedText = numsToLetters(decodedNums);

    console.log(`Decoded text: ${decodedText}`);
    console.log(
      `Hint: ${hintEncodedIndependent(
        guessEncNums,
        TARGET_ENC_NUMS
      )}`
    );

    // Optional: show the expected encoded phrase (comment out to keep it secret)
    // console.log(`(Debug) Expected encoded phrase: ${TARGET_ENC_TEXT}\n`);

    if (guessEncText === TARGET_ENC_TEXT) {
      console.log("Matched the expected encoded string. Nice!");
      rl.close();
      return;
    }

    ask();
  });
}

// Optional: show the target encoded up front (comment out to keep it secret)
console.log(`(Debug) Target plaintext: ${TARGET_PLAIN}`);
console.log(`(Debug) Target encoded:   ${TARGET_ENC_TEXT}\n`);

ask();
