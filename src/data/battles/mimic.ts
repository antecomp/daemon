import { OpponentProfile } from '@/features/battlenew/bridge/battleProfiles';
import mimicry_icon from "@/assets/artwork/dæmons/mimicry_icon.png"
import mimicry_sprite from "@/assets/artwork/dæmons/mimicry.png"
import distortedGridShader from '@/assets/background-shaders/disgrid.glsl'
import { mirrorPlan, STOCK_PLANBANK } from "@/core/battlenew/moves/plannedMoves";
import pick from "@/shared/utils/pick";
import { buildSequenceFromWeightMap } from "@/core/battlenew/ai/weightedSequenceAI";
import { ManiaStatus } from '@/core/battlenew/statuses/statuses';

const mimicry_planbank = {
    ...pick(STOCK_PLANBANK, ['evade', 'defend', 'repeat', 'mirror', 'attack']),
    mirror2: mirrorPlan,
    mirror3: mirrorPlan
}

const DESPERATION_HEALTH = 3;

export const OPPONENT_MIMICRY: OpponentProfile = {
    display: {
        name: "fractured mimicry",
        icon: mimicry_icon,
        lexicon: {
            'mirror': {
                label: 'Reflect' // Test label override for opponent
            }
        },
        sprite: mimicry_sprite,
        backgroundShader: distortedGridShader,
        spriteOffset: {x: -14, y: 15},
        behaviors: {
            postRound: [
                {
                    key: 'desperation',
                    when({combatants: {opponent}}) {
                        return opponent.health < DESPERATION_HEALTH;
                    },
                    run({appendActionMessage}) {
                        appendActionMessage('The Mimicry appears desperate!');
                    },
                    once: true
                }
            ]
        }
    },

    logic: {
        ai: {
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
            },
            behaviors: {
                postRound: [{
                    key: 'desperation',
                    when({combatants: {opponent}}) {
                        return opponent.health < DESPERATION_HEALTH
                    },
                    run({combatants: {opponent}}) {
                        opponent.addStatus(new ManiaStatus, 999);
                    },
                    once: true
                }]
            }
        },
        
        stats: { maxHealth: 10 }
    },
}