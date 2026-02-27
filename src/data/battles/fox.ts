import { COMMON_PLANNED_MOVES } from "@/core/battle/moves/plannedMoves";
import { OpponentProfile } from "@/features/battle/bridge/battleProfiles";
import pick from "@/shared/utils/pick";

import sprite from '@/assets/artwork/dæmons/combat_fox.png';
import icon from '@/assets/artwork/dæmons/fox_icon.png';
import backgroundShader from '@/assets/background-shaders/disgrid.glsl'
import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";
import { PLACES } from "@/features/battle/drama/drama.types";
import { COMMON_OVERLAY_ANIMATION_DEFINITIONS } from "@/features/battle/animation/overlayAnimations/overlayAnimationDefinitions";

const FOX_MOVEBANK = {
    ...pick(COMMON_PLANNED_MOVES, ['attack', 'evade', 'defend', 'idle', 'overwhelm', 'repeat', 'heal']),
    idleAgain: COMMON_PLANNED_MOVES.idle,
    attackAgain: COMMON_PLANNED_MOVES.attack
}

export const OPPONENT_FOX: OpponentProfile = {
    display: {
        sprite, icon, backgroundShader,
        name: "Rogue Zenko",
        initMessage: "The Rogue Zenko bares its teeth!",
        lexicon: {
            attack: { label: "bite" },
            idle: { label: "growl" },
            heal: { label: "rest" }
        },
        spriteOffset: { x: 0, y: 30 },
        dramas: {
            'zenko-growl': {
                place: PLACES.PRE_CLASH,
                when: ({plannedMoves}) => plannedMoves.opponent.name == 'idle',
                run: ({appendActionMessage}) => appendActionMessage("The Rogue Zenko growls loudly!")
            }
        },
        overlayAnimationsTable: {
            // replace attack animation
            'opp-attack': COMMON_OVERLAY_ANIMATION_DEFINITIONS.bite
        }
    },

    logic: {
        stats: { maxHealth: 15 },
        ai: {
            getSequence() {
                return buildSequenceFromWeightMap(FOX_MOVEBANK, {
                    evade: { attack: 2, attackAgain: 2 }, // Take advantage of mania
                    attack: { repeat: 2 },
                    attackAgain: { repeat: 2 }
                })
            }
        }
    }
}