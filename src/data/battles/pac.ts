import { OpponentProfile } from "@/features/battle/bridge/battleProfiles";
import sprite from '@/assets/artwork/dæmons/pac.gif';
import icon from '@/assets/artwork/dæmons/debug_angel_icon.png';
import backgroundShader from '@/assets/background-shaders/vortex.glsl';
import { COMMON_PLANNED_MOVES } from "@/core/battle/moves/plannedMoves";
import animateAsync from "@/shared/utils/animateAsync";
import COMMON_DRAMA_TABLE from "@/features/battle/drama/commonDrama";
import sleep from "@/shared/utils/sleep";

export const OPPONENT_PAC: OpponentProfile = {
    display: {
        name: ":pac:",
        sprite, icon, backgroundShader,
        initMessage: ":pac: chomps into battle!",
        lexicon: {
            attack: { label: "chomp" }
        },
        dramas: {
            'opp-attack': {
                ...COMMON_DRAMA_TABLE['opp-attack'],
                run: ({refRegistry}) => {
                    const sprite = refRegistry.opponentSprite;
                    if (!sprite) return;
                    animateAsync(sprite, [{ scale: '1' }, { 'scale': '5' }, { scale: '1' }], { duration: 500 });
                    return sleep(250); // should advance to damage right after he is max size;
                }
            }
        }
    },

    logic: {
        stats: { maxHealth: 30 },
        ai: {
            getSequence() {
                const attck = COMMON_PLANNED_MOVES.attack
                return [attck, attck, attck, attck, attck];
            }
        }
    }
}