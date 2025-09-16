/* @refresh reload */
import { render } from 'solid-js/web'
import 'lume'
import Main from './app/Main.tsx'
import '@/styles/base.css'

const root = document.getElementById('root')

render(() => <Main/>, root!)
