import icon from '@/assets/artwork/dæmons/debug_angel_icon.png';
import sprite from '@/assets/artwork/dæmons/crow_sketch_4.png';
import backgroundShader from '@/assets/background-shaders/stars.glsl'
import { planMove, COMMON_PLANNED_MOVES } from '@/core/battle/moves/plannedMoves';
import pick from '@/shared/utils/pick';
import { attack } from '@/core/battle/moves/moves';
import { OpponentProfile } from '@/features/battle/bridge/battleProfiles';
import { buildSequenceFromWeightMap } from '@/core/battle/ai/weightedSequenceAI';
import { DramaEntry } from '@/features/battle/drama/drama.types';
import COMMON_DRAMA_TABLE from '@/features/battle/drama/commonDrama';
import sleep from '@/shared/utils/sleep';

import claw_sound_a from '@/assets/sfx/battle/claw.wav';
import claw_sound_b from '@/assets/sfx/battle/claw2.wav'
import { playSound } from '@/core/audio/audio';

const CROW_PLANBANK = {
    ...pick(COMMON_PLANNED_MOVES, ['attack', 'defend', 'overwhelm', 'heal', 'repeat', 'evade']),
    attack1: planMove(attack), attack2: planMove(attack), 
}

export const CLAW_DRAMA: DramaEntry = {
    ...COMMON_DRAMA_TABLE['opp-attack'],
    run: async ({requestOverlayAnimation, fulfillDramaObligation}) => {
        playSound(claw_sound_a);
        requestOverlayAnimation('claw-a', [-280, -100]);
        await sleep(380);
        playSound(claw_sound_b);
        await requestOverlayAnimation('claw-b', [280, 80]);
        fulfillDramaObligation.playerDamage();
    }
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
            heal: {
                label: 'roost',
                //icon: BATTLE_RUNE_IMGS.priestess
            }
        },
        dramas: {
            'opp-attack': CLAW_DRAMA
        }
    },
    logic: {
        stats: {maxHealth: 10},
        ai: {
            getSequence() {
                return buildSequenceFromWeightMap(CROW_PLANBANK, {
                    attack: { attack1: 3, attack2: 3 },
                    attack1: { attack: 3, attack2: 3 },
                    attack2: { attack: 3, attack1: 3 },
                })
            }
        }
    }
}