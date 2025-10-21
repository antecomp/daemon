import '@/shared/styles/base.css'

import Battle from "@/features/battlenew/Battle";
import { PlayerProfile } from '@/features/battlenew/bridge/battleProfiles';
import { render } from "solid-js/web";



import { OPPONENT_SERPENT } from "@/data/battles/serpent";
import { OPPONENT_ANGEL } from '@/data/battles/angel';
import { OPPONENT_MIMICRY } from '@/data/battles/mimic';

const plyr: PlayerProfile = {
    display: {
        lexicon: {}
    }
}

const root = document.getElementById('root');
render(() => (
    <main id="game-root">
        <Battle opponentProfile={OPPONENT_MIMICRY} playerProfile={plyr} onEnd={(o) => alert('Battele End: ' + o)} />
        <div id="modal-root"/>
    </main>
)
, root!)