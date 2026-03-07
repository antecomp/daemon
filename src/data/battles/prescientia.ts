import icon from '@/assets/artwork/dæmons/debug_angel_icon.png';
import sprite from '@/assets/artwork/dæmons/prep.png';
import backgroundShader from '@/assets/background-shaders/rings.glsl';
import { CLAW_DRAMA } from './crow';
import { OpponentProfile } from '@/features/battle/bridge/battleProfiles';
import pick from '@/shared/utils/pick';
import { COMMON_PLANNED_MOVES } from '@/core/battle/moves/plannedMoves';
import { buildSequenceFromWeightMap } from '@/core/battle/ai/weightedSequenceAI';

const PLANBANK = {
    ...pick(COMMON_PLANNED_MOVES, ['attack', 'defend', 'overwhelm', 'heal', 'repeat', 'evade', 'prepare']),
    attack1: COMMON_PLANNED_MOVES.attack,
    // increase likelyhood.
    prepare1: COMMON_PLANNED_MOVES.prepare,
    prepare2: COMMON_PLANNED_MOVES.prepare
}

export const OPPONENT_PRESCIENTIA: OpponentProfile = {
    display: {
        name: "Prescientia",
        initMessage: "A Prescientia swoops forward!",
        icon, sprite, backgroundShader,
        spriteOffset: {
            x: 0,
            y: 20
        },
        lexicon: {
            attack: { label: 'claw' },
            heal: { label: 'roost' }
        },
        dramas: {
            'opp-attack': CLAW_DRAMA
        }
    },

    logic: {
        stats: { maxHealth: 10 },
        ai: {
            getSequence: () => buildSequenceFromWeightMap(PLANBANK, {
                prepare: { repeat: 2, prepare2: 2, attack: 3, attack1: 3, overwhelm: 2 },
                prepare2: { repeat: 2, prepare: 2, attack: 3, attack1: 3, overwhelm: 2 },
                prepare1: { repeat: 2, prepare2: 2, attack: 3, attack1: 3, overwhelm: 2 }
            })
        }
    }
}