/* @refresh reload */
import { render } from 'solid-js/web'
import 'lume'
import 'solid-devtools'
import Main from '@/app/Main.tsx'
import '@/shared/styles/base.css'
import '@/devtools/dev';

const root = document.getElementById('root')

render(() => <Main/>, root!)
