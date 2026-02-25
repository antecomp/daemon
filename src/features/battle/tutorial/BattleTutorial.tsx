import err_icon from '@/features/battle/tutorial/assets/err.png'



import bt1 from './assets/bt1.png';
import bt2 from './assets/bt2.png';
import bt3 from './assets/bt3.png';
import bt4 from './assets/bt4.png';
import bt5 from './assets/bt5.png';
import bt6 from './assets/bt6.png';
import bt7 from './assets/bt7.png';

import spawnPopup from '@/app/shell/popup/Popup'
import { createTutorialOverlay } from '@/shared/ui/extras/TutorialOverlay'

const TUTORIAL_POPUP_CONTENT =
    <>
        <p
            style={{
                'display': 'grid',
                'grid-template-columns': 'auto auto',
                'padding': '10px',
                'place-items': 'center',
                gap: '10px'
            }}
        >
            <img src={err_icon} />
            DV AUTOMATION FAILURE. MANUAL ENGAGEMENT ACTIVATED.
            <br />
        </p>
        <i
        style={{
            position: 'absolute',
            bottom: '3px',
            left: '8px'
        }}
        >Show Tutorial?
        </i>
    </>;

export default function showBattleTutorial() {
    spawnPopup(TUTORIAL_POPUP_CONTENT, [
        {
            prompt: 'No',
            action: () => { }
        },
        {
            prompt: 'Yes',
            action() { createTutorialOverlay([bt1, bt2, bt3, bt4, bt5, bt6, bt7]) }
        },
    ],
        'DAEMONVEIL'
    )
}