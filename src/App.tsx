import './style/base.css'
// import 'lume'
// import Main from './components/views/main/Main'
import { DG_VER } from './config'
import Battle from './components/views/battle/Battle'
//import { OPPONENT_PANOPTES } from './battles/panoptes'
//import { OPPONENT_NEWPORTS } from './battles/newports'
import { OPPONENT_MIMICRY } from './battles/mimicry'


function App() {
  // Will change to switch current screen based on game triggers.
  return (
    <>
      <footer id='dg-ver'>daemon.garden ({DG_VER})</footer>
      {/* <Main/> */}
      <Battle opponentData={OPPONENT_MIMICRY}/>
    </>
  )
}

export default App
