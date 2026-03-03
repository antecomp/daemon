import { INITIAL_SCENE, MAIN_CHARACTER_VLID, VERSION } from '@/config/init.config';
import './about.css';
import ascma from '@/assets/ui/misc/ASCMA.png';
import { toggleFullscreen } from '@/platform/settings';
import { setCurrentScene } from '@/app/shell/scene-container/sceneState';
import { createTooltip } from '@/shared/hooks/createTooltip';


export default function About(props: {closeSelf: () => void}) {

    const {showTooltip, hideTooltip, TooltipComponent} = createTooltip();

    return (
        <div
            class="dg-about"
        >
            <div class="sl">
                <div>
                    <img src={ascma} />
                </div>
                <div class="dg-about-right">
                    <section data-label="ABOUT:INTERFACE">
                        VI-LINK MODEL: XA-3 [2093] <br />
                        FIRMWARE VER: {VERSION} <br />
                        VLID: {MAIN_CHARACTER_VLID.toUpperCase()}
                    </section>
                    <section data-label="ABOUT:SOFTWARE">
                        VI-LINK REGISTERED FOR ARDA M. <br />
                        COVERED UNDER LIMITED WARRANTY. FOR TECHNICAL SUPPORT <a
                         href="https://omni.vi/card/"
                         target='_blank'
                         onMouseEnter={(() => showTooltip(() => <p style={{background: 'black', padding: '5px', border: 'solid white 1px', color: 'mediumseagreen'}}>Game is in early development! <br /> Please reach out if you encounter any bugs!</p>))}
                         onMouseLeave={hideTooltip}
                         >CONTACT US.</a>
                    </section>
                    <section data-label="CREDITS">
                        CREATED BY THE <a href="https://omni.vi" target='_blank'>OMNIDISPLAY CORPORATION</a>, A SUBSIDIARY OF ASURACOM. <br />
                        VISUAL RENDERING: KERS INC. <br />
                        PSYCHOLOGICAL OPERATIONS: THE MORIBUND GROUP & FLOWERS OF THE MOON <br />
                        QUALITY CONTROL: MGDC.
                    </section>
                    <section data-label="SETTINGS" style={{ display: 'flex' }}>
                        <button onclick={toggleFullscreen}>TOGGLE FULLSCREEN</button>
                        <button onclick={() => setCurrentScene(INITIAL_SCENE)} style={{ color: 'red' }}>FACTORY RESET</button>
                    </section>
                </div>
            </div>
            <hr />
            <button onclick={props.closeSelf}>CLOSE</button>
            <TooltipComponent/>
        </div>
    )
}