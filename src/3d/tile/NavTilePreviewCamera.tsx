export default function NavTilePreviewCamera(props: { chunk: [number, number], chunkWSSize: number, offsets: {x: number, z: number} }) {
    return <lume-camera-rig
        align-point="0.5 0.5"
        // distance="1500"
        max-distance='Infinity'
        min-distance='0'
        initial-polar-angle='75'
        distance='250'
        max-horizontal-angle='60'
        min-horizontal-angle='-60'
        horizontal-angle='0'
        position={`${props.offsets.x + (props.chunk[0] * props.chunkWSSize)} 0 ${props.offsets.z + (props.chunk[1] * props.chunkWSSize)}`}
    />
}