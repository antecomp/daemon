import Battle, { OpponentProfile, PlayerProfile } from "@/features/battlenew/Battle";
import { render } from "solid-js/web";

import opp_icon from "@/assets/artwork/dæmons/debug_angel_icon.png"
import { PlannedMove } from "@/core/battlenew/model/plannedmove";
import { OpponentAI } from "@/core/battlenew/ai/opponentAI.types";
import { planMove } from "@/core/battlenew/moves/plannedMoves";
import { attack, idle } from "@/core/battlenew/moves/moves";

import '@/shared/styles/base.css'

import test_sprite from '@/assets/artwork/dæmons/debug_angel.png'
import bg_shader from '@/features/battlenew/backgrounds/vortex.glsl'

function generateSampleOpponentAI(plan?: PlannedMove[]): OpponentAI {
    return {
        getSequence: (_me, _player) => plan ?? [planMove(idle), planMove(attack), planMove(idle), planMove(idle), planMove(idle)]
    }
}

const opp: OpponentProfile = {
    display: {
        name: 'test opponent',
        icon: opp_icon,
        lexicon: {},
        sprite: test_sprite,
        backgroundShader: bg_shader
    },

    logic: {
        ai: generateSampleOpponentAI(),
        stats: {maxHealth: 15}
    }
}

const plyr: PlayerProfile = {
    display: {
        lexicon: {}
    }
}

const root = document.getElementById('root');
render(() => (
    <main id="game-root">
        <Battle opponentProfile={opp} playerProfile={plyr} />
        <div id="modal-root"/>
    </main>
)
, root!)