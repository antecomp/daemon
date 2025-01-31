import { createSignal } from 'solid-js'
import './style/base.css'
import 'lume'

function App() {
//const [count, setCount] = createSignal(0)



  return (
    <>
<div id="scene-container">
<lume-scene webgl physically-correct-lights perspective="800" fog-mode="linear" fog-color="#8338ec" fog-near="600" fog-far="900">
  <lume-camera-rig align-point="0.5 0.5" distance="800"></lume-camera-rig>

  <lume-point-light intensity="1200" align-point="0.5 0.5" position="300 -300 300" color="#ff006e">
    <lume-sphere size="20" cast-shadow="false" receive-shadow="false" color="#ff006e" has="basic-material"></lume-sphere>
  </lume-point-light>

  <lume-point-light intensity="1200" align-point="0.5 0.5" position="-300 300 -300" color="#3a86ff">
    <lume-sphere size="20" cast-shadow="false" receive-shadow="false" color="#3a86ff" has="basic-material"></lume-sphere>
  </lume-point-light>

  <lume-point-light intensity="1200" align-point="0.5 0.5" position="-300 300 300" color="#3a86ff">
    <lume-sphere size="20" cast-shadow="false" receive-shadow="false" color="#3a86ff" has="basic-material"></lume-sphere>
  </lume-point-light>

  <lume-point-light intensity="1200" align-point="0.5 0.5" position="300 -300 -300" color="#ff006e">
    <lume-sphere size="20" cast-shadow="false" receive-shadow="false" color="#ff006e" has="basic-material"></lume-sphere>
  </lume-point-light>

  <lume-box 
    id="box" 
    cast-shadow="false" 
    receive-shadow="false" 
    has="physical-material" 
    roughness="0.8" 
    align-point="0.5 0.5" 
    mount-point="0.5 0.5 0.5" 
    size="200 200 200" 
    color="white" 
    rotation={(x: number,y: number) => [x+0.5, y+0.5]}
    position={(x:number, y:number, z:number) => [x, y, 0.02 * (0 - z) + z]}
  ></lume-box>
</lume-scene>

</div>
    </>
  )
}

export default App
