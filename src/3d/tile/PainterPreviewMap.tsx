import world from '@/scenes/Test/assets/world.glb';

export default function PainterPreviewMap() {
    return <>
        <lume-ambient-light intensity={1} />

        <lume-gltf-model
            align-point="0.5 0.5"
            scale="100 100 100"
            src={world}
        />

    </>
}