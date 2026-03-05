/* @refresh reload */
import { render } from 'solid-js/web'
import 'lume'
import Main from '@/app/Main.tsx'
import '@/shared/styles/base.css'
import '@/devtools/dev';

// slows HMR time. Disable unless needed.
//import 'solid-devtools'

const root = document.getElementById('root')

render(() => <Main/>, root!)
