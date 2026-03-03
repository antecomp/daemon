import vl_badge from './assets/vl_badge.png'
import { pushUILayer } from '../layers/UILayerManager'
import About from "@/features/about/About.tsx"

export default function VLBadge() {
    return (
        <img class="vl-badge" src={vl_badge} onClick={() => {
            const { popLayer } = pushUILayer({
                component: () => <About closeSelf={() => popLayer()} />,
                blockBehind: true,
                classList: { centered: true }
            })
        }} />
    )
}