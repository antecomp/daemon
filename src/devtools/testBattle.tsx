import Battle, {  } from "@/features/battlenew/Battle";
import { OpponentProfile, PlayerProfile } from '@/features/battlenew/bridge/battleProfiles';
import { render } from "solid-js/web";

import opp_icon from "@/assets/artwork/dæmons/debug_angel_icon.png"
import { PlannedMove } from "@/core/battlenew/model/plannedmove";
import { OpponentAI } from "@/core/battlenew/ai/opponentAI.types";
import { planMove } from "@/core/battlenew/moves/plannedMoves";
import { attack, idle, prepare } from "@/core/battlenew/moves/moves";

import '@/shared/styles/base.css'

import test_sprite from '@/assets/artwork/dæmons/debug_angel.png'
import bg_shader from '@/assets/background-shaders/vortex.glsl'
import { OPPONENT_ANGEL } from "@/data/battles/angel";

function generateSampleOpponentAI(plan?: PlannedMove[]): OpponentAI {
    return {
        getSequence: (_me, _player) => plan ?? [planMove(prepare), planMove(attack), planMove(idle), planMove(idle), planMove(idle)]
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
        <Battle opponentProfile={OPPONENT_ANGEL} playerProfile={plyr} />
        <div id="modal-root"/>
    </main>
)
, root!)