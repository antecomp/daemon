import '@/shared/styles/base.css';
import EnochPuzzle from "@/features/puzzles/enoch/enochPuzzle";
import { render } from "solid-js/web";

// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => <EnochPuzzle target='APPLES' />, domroot);