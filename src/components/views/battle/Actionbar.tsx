import './actionbar.css'
import Runebuilder from './Runebuilder'
import eject_button from './assets/eject-button.png'

export default function Actionbar() {
    return (
        <div id="battle-actionbar">
            <div class="left">
                <Runebuilder/>
                <img src={eject_button} id='eject-button' />
            </div>
            <div class="moves">

            </div>
            <div class="right">
            </div>
        </div>
    )
}