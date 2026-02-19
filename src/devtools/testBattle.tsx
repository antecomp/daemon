import '@/shared/styles/base.css'

import Battle from "@/features/battle/Battle";
import { PlayerProfile } from '@/features/battle/bridge/battleProfiles';
import { render } from "solid-js/web";

import { OPPONENT_MYSTERYMAN } from '@/data/battles/mysteryman';

const plyr: PlayerProfile = {
    display: {
        name: 'The Player',
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
        <Battle opponentProfile={OPPONENT_MYSTERYMAN} playerProfile={plyr} onEnd={(o) => alert('Battele End: ' + o)} />
        <div id="modal-root"/>
    </main>
)
, root!)