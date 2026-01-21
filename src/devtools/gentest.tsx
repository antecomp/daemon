import '@/shared/styles/base.css';
import { render } from "solid-js/web";


// chage this out as needed
const domroot = document.getElementById('gentest');
if (domroot) render(() => 'egg', domroot);