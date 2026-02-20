import './styles/forsake.css'

import left from '../assets/forsake_left.png'
import right from '../assets/init_right.png'
import forsake_br from '../assets/forsake-br.png'

export default function Forsake(props: { forsake: (v: any) => void }) {

    let closeAnimationPlaying = false;
    function circleCollapseAnimation(circle: SVGCircleElement, duration: number): Promise<Animation> {
        divRef.animate([{ opacity: 1 }, { opacity: 0 }], { 'fill': 'forwards', duration: duration / 4 })

        const start = circle.r.baseVal.value;
        const animation = circle.animate(
            [
                { r: start },
                { r: 0 }
            ],
            {
                duration,
                easing: 'ease-in',
                fill: 'forwards'
            }
        );

        return animation.finished;
    }

    let svgRef!: SVGSVGElement // bruh what the hell is this type name lol.
    let circleRef!: SVGCircleElement;
    let divRef!: HTMLDivElement

    async function forsakeAnimation() {
        if (closeAnimationPlaying) return;
        closeAnimationPlaying = true;
        svgRef.classList.add('collapsing');
        await circleCollapseAnimation(circleRef, 200);
        props.forsake(undefined);
    }

    return (
        <>
            <svg
                class="forsake-svg cursor-pointer"
                ref={svgRef}
                height={500} width={500}
                xmlns="http://www.w3.org/2000/svg"
                onClick={forsakeAnimation}
            >
                <circle
                    ref={circleRef} r="225"
                    cx="250" cy="250"
                    stroke='white'
                    stroke-width='7' fill='transparent'
                />
            </svg>
            <div ref={divRef} class="battle-forsake cursor-pointer" onClick={forsakeAnimation}>
                <img src={left} />
                <span>DAEMONIC VIVIDITY CRITICAL.</span>
                <img src={right} />
                <div class="forsake-bottom">
                    <span>CLICK TO FORSAKE </span>
                    <img src={forsake_br} />
                </div>
            </div>
        </>
    )
}