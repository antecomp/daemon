import 'lume'

export default function AnotherScene() {
    return(
        <lume-scene id="scene" webgl shadowmap-type="pcfsoft">
	<lume-element3d align-point="0.5 0.5">
		
		<lume-camera-rig distance="600" min-distance="90" max-distance="2000"></lume-camera-rig>

		
		<lume-sphere
			id="stars"
			texture="./galaxy_starfield.png"
			receive-shadow="false"
			has="basic-material"
			sidedness="back"
			size="4000 4000 4000"
			mount-point="0.5 0.5 0.5"
			color="black"
		></lume-sphere>

		
		<lume-element3d rotation="0 -50 0">
			<lume-element3d rotation="10 0 0">

				<lume-directional-light
					id="light"
					debug="false"
					size="0 0"
					position="0 0 1800"
					color="white"
					intensity="3"
					distance="10000"
					xxx="Here we adjust the shadow camera size so it fits around the earth and moon, making the shadow as crisp as possible without increasing the shadow texture size."
					shadow-camera-near="1500"
					shadow-camera-far="2100"
					shadow-camera-top="100"
					shadow-camera-right="100"
					shadow-camera-bottom="-100"
					shadow-camera-left="-100"
				></lume-directional-light>
			</lume-element3d>
		</lume-element3d>

		<lume-element3d>
			<lume-element3d rotation="0 180 0">
				<lume-sphere
					id="earth"
					texture="./earthmap1k.jpg"
					bump-map="./earthbump1k.jpg"
					specular-map="./earthspec1k.jpg"
					size="120 120 120"
					mount-point="0.5 0.5 0.5"
					color="white"
				>
					<lume-sphere
						id="clouds"
						texture="./earthclouds.png"
						opacity="0.7"
						size="125 125 125"
						mount-point="0.5 0.5 0.5"
						align-point="0.5 0.5 0.5"
						color="white"
					></lume-sphere>
				</lume-sphere>
			</lume-element3d>

		
			<lume-element3d rotation="90 10 0">
				<lume-element3d id="moonRotator" rotation="0 0 40">
		
		
					<lume-sphere
						id="moon"
						texture="./moon.jpg"
						position="250"
						size="5 5 5"
						mount-point="0.5 0.5 0.5"
						color="white"
					></lume-sphere>
				</lume-element3d>
			</lume-element3d>
		</lume-element3d>
	</lume-element3d>
</lume-scene>
    )
}