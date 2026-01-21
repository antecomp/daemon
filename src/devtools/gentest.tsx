import '@/shared/styles/base.css';
import EnochPuzzle from "@/features/puzzles/enoch/EnochPuzzle";
import { render } from "solid-js/web";
import Popup from '@/app/shell/popup/Popup';
import name from '../assets/ui/icons/popup-icons/alert.png';


// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => 'egg', domroot);