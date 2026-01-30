//import world from '@/scenes/TestA/assets/world.glb';

import world from '@/scenes/Bridge/assets/bridge_a_bake.glb';
import river from '@/scenes/Bridge/assets/river.glb'
import island_surface from '@/scenes/Bridge/assets/island_surface.glb'

export default function PainterPreviewMap() {
    return <>
        <lume-ambient-light intensity={1} />

        <lume-gltf-model
            align-point="0.5 0.5"
            scale="10 10 10"
            src={world}
        />

        <lume-gltf-model
            align-point="0.5 0.5"
            scale="10 10 10"
            src={river}
        />

        <lume-gltf-model
            align-point="0.5 0.5"
            mount-point="0.5 0.5"
            scale="10 10 10"
            position="1100,0,0"
            src={island_surface}
        />

    </>
}