import { OpponentProfile } from '@/features/battle/bridge/battleProfiles';

import debug_angel_icon from "@/assets/artwork/dæmons/debug_angel_icon.png";
import debug_angel_sprite from '@/assets/artwork/dæmons/debug_angel.png';
import basic_grid_bg from '@/assets/artwork/battle_bgs/debug_angel_bg.png';
import testShader from "@/assets/background-shaders/test.glsl";
import { mirrorPlan, COMMON_PLANNED_MOVES } from "@/core/battle/moves/plannedMoves";
import pick from "@/shared/utils/pick";
import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";
import COMMON_DRAMA_TABLE from '@/features/battle/drama/commonDrama';
import { PLACES } from '@/features/battle/drama/drama.types';
import animateAsync from '@/shared/utils/animateAsync';

const mimicry_planbank = {
    ...pick(COMMON_PLANNED_MOVES, ['evade', 'defend', 'repeat', 'mirror', 'attack', 'prepare']),
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
        backgroundShaderTexture: basic_grid_bg,
        behaviors: {
            preRound: [
                {
                    key: 'exasdf',
                    run({ appendActionMessage }) {
                        appendActionMessage('This should run at the very first round and never again!');
                    },
                    once: true
                },
                {
                    key: 'egg',
                    run({ appendActionMessage }) {
                        appendActionMessage('This will run every round!')
                    },
                    when() { return true }
                },
                {
                    key: 'sdflkgjh',
                    run({ appendActionMessage }) {
                        appendActionMessage('This should never run!')
                    },
                    when() { return false }
                }
            ],
        },
        dramas: {
            'opp-shield': {
                ...COMMON_DRAMA_TABLE['opp-shield'],
                run(deps, data) {
                    deps.appendActionMessage('addition to shield by angel');
                    return COMMON_DRAMA_TABLE['opp-shield'].run(deps,data);
                }
            },
            // goofy test of a completely new method.
            'full-spin': {
                place: PLACES.POST_CLASH,
                when: () => true,
                run: ({refRegistry}) => refRegistry.opponentSprite && animateAsync(refRegistry.opponentSprite, [{rotate: '0deg'}, {rotate: '360deg'}], {duration: 3000})
            }
        }
    },

    logic: {
        ai: {
            getSequence(me) {
                if (me.health < 5) {
                    const desperate_movebank = {
                        ...pick(COMMON_PLANNED_MOVES, ['evade', 'defend', 'repeat', 'attack']),
                        attack2: COMMON_PLANNED_MOVES.attack,
                        attack3: COMMON_PLANNED_MOVES.attack
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
            },
            behaviors: {
                // preRound: [{
                //     key: 'example',
                //     run({combatants}){
                //         combatants.opponent.health > 1 && combatants.opponent.takeDamage(1);
                //     }   
                // }]
            }
        },

        stats: { maxHealth: 10 }
    },
}