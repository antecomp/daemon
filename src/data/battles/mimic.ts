import { OpponentProfile } from '@/features/battle/bridge/battleProfiles';
import mimicry_icon from "@/assets/artwork/dæmons/mimicry_icon.png"
import mimicry_sprite from "@/assets/artwork/dæmons/mimicry.png"
import distortedGridShader from '@/assets/background-shaders/disgrid.glsl'
import { mirrorPlan, PLANNED_MOVE_REGISTRY } from "@/core/battle/moves/plannedMoves";
import pick from "@/shared/utils/pick";
import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";
import { ManiaStatus } from '@/core/battle/statuses/statuses';
import { createDialogueNode } from '@/core/dialogue/dialogueNode';
import { DialogueService } from '@/core/dialogue/dialogueService';

const mimicry_midround_dialogue_root = createDialogueNode("This is dialogue that triggers mid-round!", "Mimicry");
mimicry_midround_dialogue_root.addMessageChain([
    "I will say a few things before the battle continues",
    "The player has to advance through all this first.",
    "Okay I'm done."
]);

const mimicry_planbank = {
    ...pick(PLANNED_MOVE_REGISTRY, ['evade', 'defend', 'repeat', 'mirror', 'attack']),
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
            preRound: [
                {
                    // Play some dialogue before executing the round if the opponent is at half health.
                    key: 'midround-dialogue',
                    when({combatants: {opponent}}) {
                        return opponent.healthPercent <= 50
                    },
                    async run() {
                        await DialogueService.startDialogue(mimicry_midround_dialogue_root, {blockBehind: true})
                    },
                    once: true
                }
            ],
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
                },
            ],
        }
    },

    logic: {
        ai: {
            getSequence(me) {
                if (me.health < 5) {
                    const desperate_movebank = {
                        ...pick(PLANNED_MOVE_REGISTRY, ['evade', 'defend', 'repeat', 'attack']),
                        attack2: PLANNED_MOVE_REGISTRY.attack,
                        attack3: PLANNED_MOVE_REGISTRY.attack
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
                postRound: [
                    {
                        key: 'desperation',
                        when({combatants: {opponent}}) {
                            return opponent.health < DESPERATION_HEALTH
                        },
                        run({combatants: {opponent}}) {
                            opponent.addStatus(new ManiaStatus, 999);
                        },
                        once: true
                    }
                ],
            }
        },
        
        stats: { maxHealth: 10 }
    },
}