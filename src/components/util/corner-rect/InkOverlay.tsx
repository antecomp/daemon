export interface TriWaveInfo {
    width: number,
    height: number,
    phase: number,
    numWaves: number
    direction: "top" | "bottom"
}

interface TriangleWaveProps {
    initial: Omit<TriWaveInfo, "direction">
    final: Omit<TriWaveInfo, "direction">
}

function generateTriangleWavePoints(waveInfo: TriWaveInfo) {
    const { width, height, phase, numWaves, direction } = waveInfo
    const points: number[] = [];
    for (let i = 0; i < numWaves; i++) {
        const x1 = i * width + phase;
        const x2 = x1 + width / 2;
        const x3 = x1 + width;

        if(direction == "top") {
            const y1 = 0;
            const y2 = height;
            const y3 = y1;
            points.push(x1, y1, x2, y2, x3, y3);
        } else {
            const y1 = 100;
            const y2 = 100 - height;
            const y3 = y1;
            points.push(x1, y1, x2, y2, x3, y3);
        }
    }

    return points.join(" ");
}

export function InkOverlay({ initial, final }: TriangleWaveProps) {


    const initialPointsA = generateTriangleWavePoints({...initial, direction: "top"});
    const finalPointsA = generateTriangleWavePoints({...final, direction: "top"});

    const initialPointsB = generateTriangleWavePoints({...initial, direction: "bottom", phase: final.width / 2});
    const finalPointsB = generateTriangleWavePoints({...final, direction: "bottom", phase: final.width / 2});

    return (
        <svg width={500} height={500} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="ink-overlay">
            <filter id="displacementFilter">
                <feTurbulence
                    type="turbulence"
                    baseFrequency="0.05"
                    numOctaves="5"
                    result="turbulence"
                />
                <feDisplacementMap
                    in2="turbulence"
                    in="SourceGraphic"
                    scale="12"
                    xChannelSelector="R"
                    yChannelSelector="G" 
                />
            </filter>
            <g
                style={
                    {width: `100%`,
                        rotate: `66deg`,
                        scale: `200% 200%`,
                        "transform-origin": `center`}
                }
            >
            <polygon fill="black" points={initialPointsA} style="filter: url(#displacementFilter)">
                <animate
                    attributeName="points"
                    dur="3s"
                    // repeatCount="indefinite"
                    fill="freeze"
                    values={`${initialPointsA}; ${finalPointsA}`}
                    calcMode="spline"
                    keySplines="0.42 0 0.58 1"
                />
            </polygon>
            <polygon fill="black" points={initialPointsB} style="filter: url(#displacementFilter)">
                <animate
                    attributeName="points"
                    dur="3s"
                    fill="freeze"
                    // repeatCount="indefinite"
                    values={`${initialPointsB}; ${finalPointsB}`}
                    calcMode="spline"
                    keySplines="0.42 0 0.58 1"
                />
            </polygon>
            </g>
        </svg>
    );
}

/*
on svg
    rotate: 45deg;
    position: absolute;
    scale: 3;
    position: absolute;
    top: 0;
    left: 0;
    fill: black !important;
    translate: 741px 112px;
    shape-rendering: crispedges;

*/