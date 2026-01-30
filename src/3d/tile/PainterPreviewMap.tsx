export default function PainterPreviewMap() {
    return <>
        <lume-ambient-light intensity={1} />

        <lume-plane
            size="110 110 1"
            color="green"
            align-point="0.5 0.5"
            mount-point="0.5 0.5"
            rotation="90 0 0"
            position="0 1 0"
        />
        <lume-plane
            size="110 110 1"
            color="orange"
            align-point="0.5 0.5"
            mount-point="0.5 0.5"
            rotation="90 0 0"
            position="0 1 110"
        />
        <lume-plane
            size="110 110 1"
            color="blue"
            align-point="0.5 0.5"
            mount-point="0.5 0.5"
            rotation="90 0 0"
            position="-110 1 0"
        />
        <lume-plane
            size="110 110 1"
            color="yellow"
            align-point="0.5 0.5"
            mount-point="0.5 0.5"
            rotation="90 0 0"
            position="110 1 0"
        />
        <lume-plane
            size="110 110 1"
            color="magenta"
            align-point="0.5 0.5"
            mount-point="0.5 0.5"
            rotation="90 0 0"
            position="0 1 -110"
        />
    </>
}