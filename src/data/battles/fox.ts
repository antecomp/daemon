import { COMMON_PLANNED_MOVES } from "@/core/battle/moves/plannedMoves";
import { OpponentProfile } from "@/features/battle/bridge/battleProfiles";
import pick from "@/shared/utils/pick";

import sprite from '@/assets/artwork/dæmons/combat_fox.png';
import icon from '@/assets/artwork/dæmons/fox_icon.png';
import backgroundShader from '@/assets/background-shaders/disgrid.glsl'
import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";
import { AssetURL } from "@/shared/types/misc.types";
import { PLACES } from "@/features/battle/drama/drama.types";
import battleUIAnimations from "@/features/battle/animation/uiAnimations/battleUIAnimations";
import { playSound } from "@/core/audio/audio";
import pickRandom from "@/shared/utils/pickRandom";

const OPPONENT_PAIN_IMPORT = import.meta.glob<AssetURL>('@/assets/sfx/battle/yeah/*.ogg', {
    eager: true,
    query: '?url',
    import: 'default'
}) as Record<string, AssetURL>

const OPPONENT_PAIN_SOUNDS: AssetURL[] = [];
for (const [_k, i] of Object.entries(OPPONENT_PAIN_IMPORT)) {
    OPPONENT_PAIN_SOUNDS.push(i)
}

const FOX_MOVEBANK = {
    ...pick(COMMON_PLANNED_MOVES, ['attack', 'evade', 'defend', 'idle', 'overwhelm', 'repeat', 'heal', 'prepare']),
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
        damageDrama(deps) {
            playSound(pickRandom(OPPONENT_PAIN_SOUNDS));
            battleUIAnimations.damageFlash(deps.refRegistry.opponentSprite);
        }
    },

    logic: {
        stats: { maxHealth: 15 },
        ai: {
            getSequence() {
                return buildSequenceFromWeightMap(FOX_MOVEBANK, {
                    evade: { attack: 2, attackAgain: 2 }, // Take advantage of mania
                    prepare: { attack: 3, attackAgain: 3, heal: 2, overwhelm: 2, evade: 2, idle: 0.5 },
                    attack: { repeat: 2 },
                    attackAgain: { repeat: 2 }
                })
            }
        }
    }
}