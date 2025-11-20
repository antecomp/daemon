import { PLANNED_MOVE_REGISTRY } from "@/core/battle/moves/plannedMoves";
import { OpponentProfile } from "@/features/battle/bridge/battleProfiles";
import pick from "@/shared/utils/pick";
import bnuy_icon from '@/assets/artwork/dæmons/debug_angel_icon.png';
import bnuy_sprite from '@/assets/artwork/dæmons/HAZARD.png';
import fractal_shader from '@/assets/background-shaders/fractal.glsl'
import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";

const BNUY_PLANBANK = {
    ...pick(PLANNED_MOVE_REGISTRY, ['attack', 'evade', 'heal', 'idle', 'repeat', 'prepare', 'observe']),
    idleAgain: PLANNED_MOVE_REGISTRY.idle
}

export const OPPONENT_BNUY: OpponentProfile = {
    display: {
        name: "Actionable Threat",
        icon: bnuy_icon,
        sprite: bnuy_sprite,
        lexicon: {
            attack: {
                label: 'bite'
            },
            idle: {
                label: 'frolic'
            },
        },
        spriteOffset: {x: -18, y: 22},
        backgroundShader: fractal_shader
    },

    logic: {
        ai: {
            getSequence() {
                return buildSequenceFromWeightMap(BNUY_PLANBANK, {
                    evade: {idle: 2, idleAgain: 2}, // pretend like the bunny ran away for a while, it wont attack after evading.
                    prepare: {idle: 0.25, idleAgain: 0.25} // Avoid doing nothing after prepare - it's a waste!
                })
            }
        },
        stats: {maxHealth: 100000000000} // bnuy laughs in the face of death.
    }
}