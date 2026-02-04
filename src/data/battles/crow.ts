import icon from '@/assets/artwork/dæmons/debug_angel_icon.png';
import sprite from '@/assets/artwork/dæmons/crow_sketch.png';
import backgroundShader from '@/assets/background-shaders/stars.glsl'
import { planMove, PLANNED_MOVE_REGISTRY } from '@/core/battle/moves/plannedMoves';
import pick from '@/shared/utils/pick';
import { attack } from '@/core/battle/moves/moves';
import { OpponentProfile } from '@/features/battle/bridge/battleProfiles';
import { buildSequenceFromWeightMap } from '@/core/battle/ai/weightedSequenceAI';

const CROW_PLANBANK = {
    ...pick(PLANNED_MOVE_REGISTRY, ['attack', 'prepare', 'defend', 'observe', 'overwhelm']),
    attack1: planMove(attack), attack2: planMove(attack)
}

export const OPPONENT_CROW: OpponentProfile = {
    display: {
        name: "Puritanical Corvus",
        icon, sprite, backgroundShader,
        lexicon: {
            attack: {
                label: 'claw'
            },
        },
    },
    logic: {
        stats: {maxHealth: 10},
        ai: {
            getSequence() {
                return buildSequenceFromWeightMap(CROW_PLANBANK, {
                    attack: { attack1: 3, attack2: 3 },
                    attack1: { attack: 3, attack2: 3 },
                    attack2: { attack: 3, attack1: 3 },
                    prepare: { attack: 3, attack1: 3, attack2: 3, defend: 3, overwhelm: 4, },
                    observe: { attack: 3, attack1: 3, attack2: 3 }
                })
            }
        }
    }
}