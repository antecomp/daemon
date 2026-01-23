import EnochPuzzle from '@/features/puzzles/enoch/EnochPuzzle';
import '@/shared/styles/base.css';
import { render } from "solid-js/web";


// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => <EnochPuzzle target='ABABAA' onCorrect={() => alert('correct')} onFail={() => alert('fail')}/>, domroot);