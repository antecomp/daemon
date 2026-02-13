import '@/shared/styles/base.css'

import Battle from "@/features/battle/Battle";
import { PlayerProfile } from '@/features/battle/bridge/battleProfiles';
import { render } from "solid-js/web";



// import { OPPONENT_SERPENT } from "@/data/battles/serpent";
// import { OPPONENT_ANGEL } from '@/data/battles/angel';
//import { OPPONENT_MIMICRY } from '@/data/battles/mimic';
import { OPPONENT_CROW } from '@/data/battles/crow';

const plyr: PlayerProfile = {
    display: {
        lexicon: {
            attack: {
                label: 'overwritten'
            }
        }
    }
}

const root = document.getElementById('root');
render(() => (
    <main id="game-root">
        <Battle opponentProfile={OPPONENT_CROW} playerProfile={plyr} onEnd={(o) => alert('Battele End: ' + o)} />
        <div id="modal-root"/>
    </main>
)
, root!)