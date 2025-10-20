import { OpponentProfile } from '@/features/battlenew/bridge/battleProfiles';

import debug_angel_icon from "@/assets/artwork/dæmons/debug_angel_icon.png";
import debug_angel_sprite from '@/assets/artwork/dæmons/debug_angel.png';
import basic_grid_bg from '@/assets/artwork/battle_bgs/debug_angel_bg.png';
import testShader from "@/assets/background-shaders/test.glsl";
import { mirrorPlan, STOCK_PLANBANK } from "@/core/battlenew/moves/plannedMoves";
import pick from "@/shared/utils/pick";
import { buildSequenceFromWeightMap } from "@/core/battlenew/ai/weightedSequenceAI";

const mimicry_planbank = {
    ...pick(STOCK_PLANBANK, ['evade', 'defend', 'repeat', 'mirror', 'attack']),
    mirror2: mirrorPlan,
    mirror3: mirrorPlan
}

export const OPPONENT_ANGEL: OpponentProfile = {
    display: {
        name: "DEBVG ANGEL",
        icon: debug_angel_icon,
        lexicon: {
            'mirror': {
                label: 'Reflect' // Test label override for opponent
            }
        },
        sprite: debug_angel_sprite,
        backgroundShader: testShader,
        backgroundShaderTexture: basic_grid_bg
    },

    logic: {
        ai: {
            preRoundBehavior(self) {
                self.takeDamage(1);
            },
            getSequence(me) {
                if (me.health < 5) {
                    const desperate_movebank = {
                        ...pick(STOCK_PLANBANK, ['evade', 'defend', 'repeat', 'attack']),
                        attack2: STOCK_PLANBANK.attack,
                        attack3: STOCK_PLANBANK.attack
                    }

                    return buildSequenceFromWeightMap(
                        desperate_movebank, {
                        evade: { attack: 3, attack2: 3, attack3: 3 }
                    }
                    )
                }

                return buildSequenceFromWeightMap(
                    mimicry_planbank,
                    {
                        // Avoid doing mirror several times in a row.
                        mirror: { mirror2: 0.5, mirror3: 0.5 },
                        mirror2: { mirror: 0.5, mirror3: 0.5 },
                        mirror3: { mirror: 0.5, mirror2: 0.5 },

                        // Typical strat - Hope for mania
                        evade: { attack: 3 }
                    }
                )
            }

        },
        
        stats: { maxHealth: 10 }
    },
}