import './style/base.css'
// import 'lume'
// import Main from './components/views/main/Main'
import { DG_VER } from './config'
import Battle from './components/views/battle/Battle'
import { OPPONENT_PANOPTES } from './battles/panoptes'
import { InkOverlay, TriWaveInfo } from './components/util/corner-rect/TriangleWave';

function App() {
  // Will change to switch current screen based on game triggers.

  const initial: TriWaveInfo = {
    width: 10,
    height: 0,
    phase: 10, // 180 degrees phase shift
    numWaves: 10,
    direction: "bottom"
  };

  const final: TriWaveInfo = {
    width: 10,
    height: 100,
    phase: 10, // 180 degrees phase shift
    numWaves: 10,
    direction: "bottom"
  };

  return (
    <>
      <footer id='dg-ver'>daemon.garden ({DG_VER})</footer>
      {/* <Main/> */}
      <Battle opponentData={OPPONENT_PANOPTES}/>
      <InkOverlay initial={initial} final={final} />
    </>
  )
}

export default App
