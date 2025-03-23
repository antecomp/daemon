import './style/base.css'
import 'lume'
// import Main from './components/views/main/Main'
import { DG_VER } from './config'
import Battle from './components/views/battle/Battle'
import Main from './components/views/main/Main'
import {Match, Switch} from 'solid-js'
import { currentUIState, UIState } from './core/ui/uiState'
import { currentBattle } from './core/battle/battleManager'


function App() {
  // Will change to switch current screen based on game triggers.
  return (
    <>
      <footer id='dg-ver'>daemon.garden ({DG_VER})</footer>

      <Switch fallback={<div>SOMETHING IS FUCKING BROKEN BIG TIME LOL</div>}>
        <Match when={currentUIState() == UIState.Normal}>
          <Main/>
        </Match>
        <Match when={currentUIState() == UIState.Battle && currentBattle()}>
          <Battle opponentData={currentBattle()!.opponent}/>
        </Match>
      </Switch>
    </>
  )
}

export default App
