import './style/base.css'
import 'lume'
import Main from './components/views/main/Main'
import { DG_VER } from './config'

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
