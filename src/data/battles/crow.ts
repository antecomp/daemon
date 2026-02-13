import icon from '@/assets/artwork/dæmons/debug_angel_icon.png';
import sprite from '@/assets/artwork/dæmons/crow_sketch_4.png';
import backgroundShader from '@/assets/background-shaders/stars.glsl'
import { planMove, COMMON_PLANNED_MOVES } from '@/core/battle/moves/plannedMoves';
import pick from '@/shared/utils/pick';
import { attack } from '@/core/battle/moves/moves';
import { OpponentProfile } from '@/features/battle/bridge/battleProfiles';
import { buildSequenceFromWeightMap } from '@/core/battle/ai/weightedSequenceAI';
import { Move, MoveType } from '@/core/battle/model/move.types';
import { HealSelf } from '@/core/battle/moves/behaviors';

// Test - heal without requiring focus. Verifying custom move definitions work.
const roostMove: Move = {
    name: 'roost',
    type: MoveType.Passive,
    behaviors: {
        postEffect: HealSelf
    }
}

const CROW_PLANBANK = {
    ...pick(COMMON_PLANNED_MOVES, ['attack', 'prepare', 'defend', 'observe', 'overwhelm']),
    attack1: planMove(attack), attack2: planMove(attack), roost: planMove(roostMove)
}

export const OPPONENT_CROW: OpponentProfile = {
    display: {
        name: "Puritanical Corvus",
        initMessage: "A Puritanical Corvus swoops forward!",
        icon, sprite, backgroundShader,
        spriteOffset: { x: -10, y: 8 },
        lexicon: {
            attack: {
                label: 'claw'
            },
            roost: {
                label: 'roost'
            }
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