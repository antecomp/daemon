// Edit this to switch out the scene being previewed.

import world from '@/scenes/Islands/assets/malice.glb';
// import river from '@/scenes/Bridge/assets/river.glb';

export default function NavTilePainterScene() {
    return (
        <>
            <lume-ambient-light intensity={1} />

            <lume-gltf-model
                align-point="0.5 0.5"
                scale="10 10 10"
                src={world}
            />

        </>
    )
}