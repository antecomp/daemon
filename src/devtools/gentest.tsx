import '@/shared/styles/base.css';
import EnochPuzzle from "@/features/puzzles/enoch/EnochPuzzle";
import { render } from "solid-js/web";

// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => <EnochPuzzle onFail={() => alert('fail')} onCorrect={() => alert('Good :)')} target='ISLAND' />, domroot);