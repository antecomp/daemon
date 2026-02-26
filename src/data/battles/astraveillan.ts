import icon from '@/assets/artwork/dæmons/snaek_icon.png';
import sprite from '@/assets/artwork/dæmons/placeholder/observer.png';
import backgroundShader from '@/assets/background-shaders/stars.glsl';
import { CLAW_DRAMA } from './crow';
import { OpponentProfile } from '@/features/battle/bridge/battleProfiles';
import pick from '@/shared/utils/pick';
import { COMMON_PLANNED_MOVES } from '@/core/battle/moves/plannedMoves';
import { buildSequenceFromWeightMap } from '@/core/battle/ai/weightedSequenceAI';

const PLANBANK = {
    ...pick(COMMON_PLANNED_MOVES, ['attack', 'defend', 'overwhelm', 'heal', 'repeat', 'evade', 'observe']),
    attack1: COMMON_PLANNED_MOVES.attack,
    attack2: COMMON_PLANNED_MOVES.attack,
    // increase likelyhood.
    observe2: COMMON_PLANNED_MOVES.observe
}

export const OPPONENT_ASTRAVEILLAN: OpponentProfile = {
    display: {
        name: "Astraveillan",
        initMessage: "An Astraveillan Corvus swoops forward!",
        icon, sprite, backgroundShader,
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
                attack: { attack1: 3, attack2: 3 },
                attack1: { attack: 3, attack2: 3 },
                attack2: { attack: 3, attack1: 3 },
                observe: { attack: 3, attack1: 3, attack2: 3 },
                observe2: { attack: 3, attack1: 3, attack2: 3 }
            })
        }
    }
}