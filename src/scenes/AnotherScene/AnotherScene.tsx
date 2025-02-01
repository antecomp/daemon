import 'lume'
import mapobj from './models/map.obj?url'
import mapmtl from './models/map.mtl?url'
import player_ref from '../shared_models/player_ref.fbx?url'

export default function AnotherScene() {
    return(
		<lume-scene webgl shadow-mode="pcfsoft">
			<lume-camera-rig
				min-distance={-500}
				max-distance={5000}
				position="-100 -192 -100"
				align-point="0.5 0.5"
				interaction-type="orbit"
				id='camera'
				initial-distance={500}
			>
			</lume-camera-rig>

			<lume-point-light intensity="1200" align-point="0.5 0.5" mount-point="0.5 0.5" position="-300 -550 -300" color="white">
            	<lume-sphere size="20" cast-shadow="true" receive-shadow="false" color="#ff006e" 
				//@ts-ignore
				has="basic-material"></lume-sphere>
          	</lume-point-light>

			<lume-sphere
				size="20"
				cast-shadow="true"
				receive-shadow="false"
				color="white"
				//@ts-ignore
				has="basic-material"
				mount-point="0.5 0.5"
				align-point="0.5 0.5"
			></lume-sphere>

			<lume-sphere
				size="20"
				cast-shadow="true"
				receive-shadow="false"
				color="green"
				//@ts-ignore
				has="basic-material"
				mount-point="0.5 0.5"
				align-point="0.5 0.5"
				position="0 0 -248"
			></lume-sphere>

		<lume-fbx-model 
			id="playerRef" 
			src={player_ref}
			mount-point="0.5 0.5"
			align-point="0.5 0.5"
		></lume-fbx-model>

		  <lume-ambient-light intensity={0.05} />
			<lume-obj-model 
				id="map" 
				obj={mapobj}
				mtl={mapmtl}
				color="white"
				recieve-shadow="true"
				cast-shadow="true"
				align-point="0.5 0.5"
				mount-point="0.5 0.5"
				//position="-175 -100 0"
			></lume-obj-model>
			
		</lume-scene>
    )
}