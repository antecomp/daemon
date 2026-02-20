import err_icon from '@/features/battle/tutorial/assets/err.png'

// TODO: Update and replace these:
import bt1 from '@/assets/placeholders/battletut/tut1.png'
import bt2 from '@/assets/placeholders/battletut/tut2.png'
import bt3 from '@/assets/placeholders/battletut/tut3.png'
import bt4 from '@/assets/placeholders/battletut/tut4.png'
import bt5 from '@/assets/placeholders/battletut/tut5.png'
import bt6 from '@/assets/placeholders/battletut/tut6.png'
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
            action() { createTutorialOverlay([bt1, bt2, bt3, bt4, bt5, bt6]) }
        },
    ],
        'DAEMONVEIL'
    )
}