import './actionbar.css'
import Runebuilder from './Runebuilder'
import eject_button from './assets/eject-button.png'
import reset_button from './assets/reset-button.png'
import exec_button from './assets/exec-button.png'
import fch_bar from './assets/f-ch-bar.png'

import ur_bar from './assets/mult_ur.png'
import us_bar from './assets/mult_us.png'
import dr_bar from './assets/mult_dr.png'
import ds_bar from './assets/mult_ds.png'

export default function Actionbar() {
    return (
        <div id="battle-actionbar">
            <div class="left">
                <img src={eject_button} id='eject-button' />
                <Runebuilder/>
                <div id="rb-buttons">
                    <img src={reset_button} id='reset-button'/>
                    <img src={exec_button} id='exec-button'/>
                </div>
            </div>
            <div class="right">
                <div class="moves">            
                </div>
                <img src={fch_bar} id="fch-bar" />
                <div id="multbars">
                    <div class="userbars">
                        <img src={ur_bar} class="ur-bar"/>
                        <img src={us_bar} class="us-bar"/>
                    </div>
                    <div class="dbars">
                        <img src={ds_bar} class="ds-bar"/>
                        <img src={dr_bar} class="dr-bar"/>
                    </div>
                </div>
            </div>
        </div>
    )
}