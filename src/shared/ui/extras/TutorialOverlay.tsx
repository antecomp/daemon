// Tutorials are just a bunch of transparent images you click through.

import { pushUILayer } from "@/app/shell/layers/UILayerManager";
import { AssetURL } from "@/shared/types/misc.types";
import { createSignal } from "solid-js";

export default function TutorialOverlay(props: {seq: AssetURL[], onComplete: () => void}) {

    const [currentIndex, setCurrentIndex] = createSignal(0);

    const nextImage = () => {
        if(currentIndex() >= props.seq.length) return;
        if((setCurrentIndex(prev => prev + 1) == props.seq.length)) {
            props.onComplete();
        }
    }

    return (
        <div class="tutorial-overlay" style={{cursor: 'var(--cursor_pointer)'}}>
            <img style={{width: '100%', height: '100%'}} src={props.seq[currentIndex()]} onClick={nextImage} />
        </div>
    )
}

export function createTutorialOverlay(seq: AssetURL[]) {
    const {popLayer} = pushUILayer({
        blockBehind: true,
        component: () => <TutorialOverlay seq={seq} onComplete={() => popLayer()} />
    });
}