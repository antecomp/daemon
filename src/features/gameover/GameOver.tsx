import { createSignal, Match, onCleanup, Switch } from 'solid-js';
import ejected_message from './assets/ejected-message.png';
import ejected_prompt from './assets/ejected-prompt.png';
import { flickerIn } from '@/shared/utils/flicker';
import './gameover.css';
import go_anim from './assets/go.mp4'
import { pushUILayer } from '@/app/shell/layers/UILayerManager';

export function GameOver(props: {
    /** Reset function to properly handle reverting state / game over punishment */
    reset: () => void;
}) {
    const [videoVisible, setVideoVisible] = createSignal(true);
    let videoEnded = false;

    let videoRef!: HTMLVideoElement;
    let ejected!: HTMLImageElement;
    let prompt!: HTMLImageElement;

    const handleVideoEnded = async () => {
        if (videoEnded) return;
        videoEnded = true;
        setVideoVisible(false);
        await flickerIn(ejected);
        await flickerIn(prompt);
        prompt.animate([{opacity: 1}, {opacity: 0.25}, {opacity: 1}], {
            iterations: Infinity,
            duration: 2000
        })
    }

    // Safety: pause if component unmounts early for some reason
    onCleanup(() => {
        videoRef?.pause();
    });

    const handleVideoClick = (e: MouseEvent) => {
        e.stopPropagation();
        videoRef.pause();
        handleVideoEnded();
    }

    const handleGeneralClick = () => {
        if(videoEnded) {
            props.reset();
        }
    }


    return <div id="game-over" onclick={handleGeneralClick}>
        <Switch>
            <Match when={videoVisible()}>
                <video
                    ref={videoRef}
                    src={go_anim}
                    autoplay
                    muted
                    onended={handleVideoEnded}
                    onclick={handleVideoClick}
                />
            </Match>
            <Match when={!videoVisible()}>
                <img ref={ejected} style={{ opacity: 0 }} src={ejected_message} />
                <img ref={prompt} style={{ opacity: 0 }} src={ejected_prompt} />
            </Match>
        </Switch>

    </div>
}

export default function triggerGameOver(cleanup: () => void) {
    const {popLayer} = pushUILayer({
        component: () => <GameOver reset={() => {
            cleanup();
            popLayer();
        }}/>,
        metaLayer: 'top',
        lock: 'all',
        blockBehind: true,
        style: {
            background: 'black',
            display: 'grid',
            'place-items': 'center'
        }
    })
}