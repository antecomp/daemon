import { OpponentProfile } from "@/features/battle/bridge/battleProfiles";
import icon from '@/assets/artwork/dæmons/debug_angel_icon.png'
import backgroundShader from '@/assets/background-shaders/vortex.glsl'
import sprite from '@/assets/artwork/dæmons/ghost.png'
import pick from "@/shared/utils/pick";
import { COMMON_PLANNED_MOVES } from "@/core/battle/moves/plannedMoves";
import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";

const GHOST_MOVEBANK = {
    ...pick(COMMON_PLANNED_MOVES, ['attack', 'overwhelm', 'prepare', 'mirror', 'defend', 'observe']),
    attack2: COMMON_PLANNED_MOVES.attack
}

export const OPPONENT_GHOST: OpponentProfile = {
    display: {
        icon, backgroundShader, sprite,
        name: "Richtie Wisp",
        lexicon: {},
        initMessage: "You sense the souls of the fallen.",
    },
    logic: {
        ai: {
            getSequence: () => buildSequenceFromWeightMap(GHOST_MOVEBANK, {
                prepare: {attack : 2, attack2: 2}
            }),
        },
        stats: {maxHealth: Number.MAX_SAFE_INTEGER}
    }
}