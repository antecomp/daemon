import './style/base.css'
import 'lume'
import SceneContainer, { setSceneName } from './components/SceneContainer'

function App() {
  return (
    <><SceneContainer /><button onClick={() => setSceneName("DefaultScene")}>Back to Default Scene</button></>
  )
}

export default App
