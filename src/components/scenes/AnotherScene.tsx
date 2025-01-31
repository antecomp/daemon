import 'lume'

export default function AnotherScene() {
    return(
		<lume-scene webgl shadow-mode="pcfsoft">
			<lume-camera-rig
				min-distance={-500}
				max-distance={5000}
				position="50 50 50"
				interaction-type="orbit"
				id='camera'
			>
			</lume-camera-rig>

			<lume-point-light intensity="1200" align-point="0.5 0.5" position="300 -300 300" color="white">
            	<lume-sphere size="20" cast-shadow="true" receive-shadow="false" color="#ff006e" has="basic-material"></lume-sphere>
          	</lume-point-light>

		  <lume-ambient-light intensity={0.05} />
			<lume-obj-model 
				id="map" obj='models/test.obj'
				color="white"
				recieve-shadow="true"
				cast-shadow="true"
				align-point="0.5 0.5"
				mount-point="0.5 0.5"
				position="-175 -100 0"
			></lume-obj-model>
			
		</lume-scene>
    )
}