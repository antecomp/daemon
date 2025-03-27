import './style/base.css'
import 'lume'
// import Main from './components/layers/main/Main'
import { DG_VER } from './config'
import Main from './views/main/Main'


function App() {
  // Will change to switch current screen based on game triggers.
  return (
    <>
      <footer id='dg-ver'>daemon.garden ({DG_VER})</footer>
      <Main/>
    </>
  )
}

export default App
