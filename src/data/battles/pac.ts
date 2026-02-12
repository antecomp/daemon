import { OpponentProfile } from "@/features/battle/bridge/battleProfiles";
import sprite from '@/assets/artwork/dæmons/pac.gif';
import icon from '@/assets/artwork/dæmons/debug_angel_icon.png';
import backgroundShader from '@/assets/background-shaders/vortex.glsl';
import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";
import { PLANNED_MOVE_REGISTRY } from "@/core/battle/moves/plannedMoves";
import { MoveUISideEffectDeps, MoveUISideEffectCTX } from "@/features/battle/effects/moveUISideEffects";
import animateAsync from "@/shared/utils/animateAsync";

export const OPPONENT_PAC: OpponentProfile = {
    display: {
        name: ":pac:",
        sprite, icon, backgroundShader,
        initMessage: ":pac: chomps into battle!",
        lexicon: {
            attack: { label: "chomp" }
        },
        moveUISideEffectOverrides: {
            attack: {
                add: [{
                    place: 2,
                    run: function (deps, ctx) {
                        const sprite = deps.refRegistry?.opponentSprite;
                        if (!sprite) return;
                        sprite.style.transformOrigin = 'top left';
                        animateAsync(sprite, [{ scale: '1' }, { 'scale': '5' }, { scale: '1' }], { duration: 500 })
                    }
                }]
            }
        }
    },

    logic: {
        stats: { maxHealth: 30 },
        ai: {
            getSequence() {
                const attck = PLANNED_MOVE_REGISTRY.attack
                return [attck, attck, attck, attck, attck];
            }
        }
    }
}