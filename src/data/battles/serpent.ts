import pan_icon from "@/assets/artwork/dæmons/snaek_icon.png"
import pan_sprite from "@/assets/artwork/dæmons/snaek.png"
import vortexShader from '@/assets/background-shaders/vortex.glsl';
import { planMove, STOCK_PLANBANK } from "@/core/battlenew/moves/plannedMoves";
import pick from "@/shared/utils/pick";
import { attack } from "@/core/battlenew/moves/moves";
import { OpponentProfile } from "@/features/battlenew/bridge/battleProfiles";
import { buildSequenceFromWeightMap } from "@/core/battlenew/ai/weightedSequenceAI";

const SERPENT_PLANBANK = {
    ...pick(STOCK_PLANBANK, ['attack', 'idle', 'prepare', 'defend']),
    attack1: planMove(attack), attack2: planMove(attack)
}

export const OPPONENT_SERPENT: OpponentProfile = {
    display: {
        name: "Panoptesian Serpent",
        icon: pan_icon,
        lexicon: {
            attack: {
                label: 'bite'
            }
        },
        sprite: pan_sprite,
        spriteOffset: { x: 0, y: -25 },
        backgroundShader: vortexShader,
    },
    logic: {
        ai: {
            getSequence() {
                // Weights indicating likelyhood that some move will succeed another... 
                // f.e let's make him very aggressive. If he attacks once, he'll likely attack again!
                return buildSequenceFromWeightMap(SERPENT_PLANBANK, {
                    attack: {attack1: 3, attack2: 3},
                    attack1: {attack: 3, attack2: 3},
                    attack2: {attack: 3, attack1: 3},
                    prepare: {attack: 3, attack1: 3, attack2: 3, defend: 3}
                })
            }
        },
        stats: {maxHealth: 10}
    }
}