import { INITIAL_SCENE, MAIN_CHARACTER_VLID, VERSION } from '@/config/init.config';
import './about.css';
import ascma from '@/assets/ui/misc/ASCMA.png';
import { toggleFullscreen } from '@/platform/settings';
import { setCurrentScene } from '@/app/shell/scene-container/sceneState';


export default function About(props: {closeSelf: () => void}) {
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
                        COVERED UNDER LIMITED WARRANTY. FOR TECHNICAL SUPPORT <a href="mailto:adm@omni.vi">CONTACT US.</a>
                    </section>
                    <section data-label="CREDITS">
                        CREATED BY THE <a href="https://omni.vi" target='_blank'>OMNIDISPLAY CORPORATION</a>, A SUBSIDIARY OF ASURACOM. <br />
                        VISUAL RENDERING: KERS INC. <br />
                        PSYCHOLOGICAL OPERATIONS: THE MORIBUND GROUP & CHELL LABS. <br />
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
        </div>
    )
}