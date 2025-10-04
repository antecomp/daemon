import Battle, { OpponentProfile, PlayerProfile } from "@/features/battlenew/Battle";
import { render } from "solid-js/web";

import opp_icon from "@/assets/artwork/dæmons/debug_angel_icon.png"
import { PlannedMove } from "@/core/battlenew/model/plannedmove";
import { OpponentAI } from "@/core/battlenew/ai/opponentAI.types";
import { planMove } from "@/core/battlenew/moves/plannedMoves";
import { idle } from "@/core/battlenew/moves/moves";

import '@/shared/styles/base.css'

function generateSampleOpponentAI(plan?: PlannedMove[]): OpponentAI {
    return {
        getSequence: (_me, _player) => plan ?? [planMove(idle), planMove(idle), planMove(idle), planMove(idle), planMove(idle)]
    }
}

const opp: OpponentProfile = {
    display: {
        name: 'test opponent',
        icon: opp_icon,
        lexicon: {}
    },

    logic: {
        ai: generateSampleOpponentAI(),
        stats: {maxHealth: 100}
    }
}

const plyr: PlayerProfile = {
    display: {
        lexicon: {}
    }
}

const root = document.getElementById('battle-test');
render(() => <Battle opponentProfile={opp} playerProfile={plyr} />, root!)