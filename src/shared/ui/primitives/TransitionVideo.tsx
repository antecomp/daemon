import { AssetURL } from "@/shared/types/misc.types";
import { createSignal, JSX, Show } from "solid-js";

export default function TransitionVideo(props: {
    src: AssetURL,
    class?: string,
    style?: JSX.CSSProperties,
    onFinished: () => void;
}) {
    const [done, setDone] = createSignal(false);

    function handleFinish() {
        setDone(true);
        props.onFinished?.();
    }

    return (
        <Show
            when={!done()}
            fallback={
                <div
                    class={props.class}
                    style={{
                        'background-color': 'black',
                        'width': '100%',
                        'height': '100%'
                    }}
                />
            }
        >
            <video
                src={props.src}
                class={props.class}
                style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    "object-fit": "contain",
                    ...props.style
                }}
                autoplay={true}
                playsinline
                onEnded={handleFinish}
                onError={handleFinish}
                disablepictureinpicture
            />
        </Show>
    )
}