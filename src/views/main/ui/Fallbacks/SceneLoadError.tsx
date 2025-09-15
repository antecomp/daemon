export default function SceneLoadError(props: {err: any, retry: (() => void), reset: (() => any)}) {
    return (
        <>
            <p>Error loading scene: {props.err.message}</p>
            <button onClick={props.retry}>Try again.</button>
            <button onClick={props.reset}>Reset to init.</button>
        </>
    )
}