import '@/shared/styles/base.css'

import Battle from "@/features/battlenew/Battle";
import { PlayerProfile } from '@/features/battlenew/bridge/battleProfiles';
import { render } from "solid-js/web";



import { OPPONENT_SERPENT } from "@/data/battles/serpent";
import { OPPONENT_ANGEL } from '@/data/battles/angel';

const plyr: PlayerProfile = {
    display: {
        lexicon: {}
    }
}

const root = document.getElementById('root');
render(() => (
    <main id="game-root">
        <Battle opponentProfile={OPPONENT_ANGEL} playerProfile={plyr} />
        <div id="modal-root"/>
    </main>
)
, root!)