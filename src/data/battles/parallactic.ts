import icon from '@/assets/artwork/dæmons/mimicry_icon.png';
import sprite from '@/assets/artwork/dæmons/placeholder/mirror.png';
import backgroundShader from '@/assets/background-shaders/vortex.glsl';
import { CLAW_DRAMA } from './crow';
import { OpponentProfile } from '@/features/battle/bridge/battleProfiles';
import pick from '@/shared/utils/pick';
import { COMMON_PLANNED_MOVES } from '@/core/battle/moves/plannedMoves';
import { buildSequenceFromWeightMap } from '@/core/battle/ai/weightedSequenceAI';

const PLANBANK = {
    ...pick(COMMON_PLANNED_MOVES, ['attack', 'defend', 'overwhelm', 'heal', 'repeat', 'evade', 'mirror']),
    attack1: COMMON_PLANNED_MOVES.attack,
    // increase likelyhood.
    mirror2: COMMON_PLANNED_MOVES.mirror,
    mirror3: COMMON_PLANNED_MOVES.mirror
}

export const OPPONENT_PARALLACTIC: OpponentProfile = {
    display: {
        name: "Parallactic",
        initMessage: "A Parallactic swoops forward!",
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
                mirror: { repeat: 2, mirror2: 2 },
                mirror2: { repeat: 2, mirror: 2 },
                mirror3: { repeat: 2, mirror2: 2 }
            })
        }
    }
}