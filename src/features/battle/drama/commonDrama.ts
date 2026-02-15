import slash_sfx from '@/assets/sfx/battle/candle.wav';
import deflect_noise from '@/assets/sfx/battle/overwhelm.wav'

import animateAsync from "@/shared/utils/animateAsync";
import { DramaTable, PLACES } from "./drama.types";
import { playSound } from "@/shared/utils/playSound";
import { AvailableOverlayAnimationNames } from "../animation/overlayAnimations/overlayAnimationDefinitions";
import sleep from "@/shared/utils/sleep";
import { MoveType } from '@/core/battle/model/move.types';

const COMMON_OPPONENT_MOVE_DRAMAS: DramaTable = {
    'opp-shield': {
        place: PLACES.CLASH_ONE,
        when: ({ moves, postCtx }) =>
            moves.opponent.name == 'defend'
            && postCtx.player.ourMults.outgoing > 0
            && moves.player.type !== MoveType.Overwhelming,
        run: ({ requestOverlayAnimation, appendActionMessage }, { opponentProfile }) => {
            appendActionMessage(opponentProfile.display.name + " endures the hit!");
            return requestOverlayAnimation('shield')
        }
    },

    'opp-evade': {
        place: PLACES.CLASH_ONE,
        when: ({ moves, postEffectOutcomes }) =>
            moves.opponent.name == 'evade'
            && postEffectOutcomes.opponent?.status == 'success',
        run: ({ refRegistry, appendActionMessage }, { opponentProfile }) => {
            appendActionMessage(opponentProfile.display.name + " dodges swiftly! " + opponentProfile.display.name + " feels invigorated!");
            const oppSprite = refRegistry.opponentSprite;
            if (!oppSprite) return;
            // Could even animate it shifting to one direction here.
            return animateAsync(oppSprite, [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }], { duration: 500 });
        }
    },

    'opp-mirror': {
        place: PLACES.CLASH_ONE,
        // When opponent deals damage as result of mirror...
        when: ({ moves, postCtx }) =>
            //plannedMoves.opponent.name == 'mirror'
            moves.opponent.tags?.includes('mirrored')
            && postCtx.opponent.damageDealt > 0,
        run: async ({ requestOverlayAnimation, dramaObligations }) => {
            sleep(500).then(() => playSound(deflect_noise));
            await requestOverlayAnimation('mirror');
            dramaObligations.playerDamage();
        }
    },

    'opp-observe': {
        place: PLACES.POST_CLASH,
        when: ({ moves }) => moves.opponent.name == 'observe',
        run: async ({ requestOverlayAnimation, appendActionMessage }, { playerProfile }) => {
            await requestOverlayAnimation('observe');
            appendActionMessage(playerProfile.display.name + " feels watched.")
        }
    }
}

const COMMON_PLAYER_MOVE_DRAMAS: DramaTable = {
    // TODO Slash
    'player-slash': {
        place: PLACES.CLASH_ONE,
        // When we attack using repeat or candle, but not mirror.
        when: ({ moves, plannedMoves }) =>
            plannedMoves.player.name !== 'mirror'
            && moves.player.name == 'attack',
        async run({ requestOverlayAnimation, dramaObligations }, { combatants, moves }) {
            playSound(slash_sfx);

            // Change how this works. Prep should take precedence over other anim types.
            if (combatants.player.getStatusLevel('mania') > 0) {
                await requestOverlayAnimation('slash_elag');
            } else if (moves.player.tags?.includes('repeated')) {
                await requestOverlayAnimation('slash_repeat');
            } else {
                const preparedLevel = combatants.player.getStatusLevel('prepared');
                await requestOverlayAnimation((['slash_norm', 'slash_purpose', 'slash_majes'] satisfies AvailableOverlayAnimationNames[])[preparedLevel] ?? 'slash_majes');
            }

            // Run opponent hit right after this
            dramaObligations.opponentDamage();
        }
    },

    // Allows us to very easily give the same move a different actions for the player.
    // Even for moves that we only get through mirroring.
    'player-observe': {
        place: PLACES.POST_CLASH,
        when: ({ moves }) => moves.player.name == 'observe',
        run: ({ appendActionMessage }, { playerProfile, opponentProfile }) =>
            appendActionMessage(`${playerProfile.display.name} keenly observes ${opponentProfile}`)
    },

    // TODO: How do we indicate the amount healed? Maybe we don't?
    // Perhaps snapshots should also be of the combatants to diff?
    'player-heal': {
        place: PLACES.POST_CLASH,
        when: ({ moves, postEffectOutcomes }) =>
            moves.player.name == 'heal'
            && postEffectOutcomes.player?.status == 'success',
        run: ({ appendActionMessage }, { playerProfile }) => appendActionMessage(`${playerProfile.display.name} ` + ' finds her resolve. F-CH restored.')
    }
}



const COMMON_DRAMA_TABLE: DramaTable = { ...COMMON_OPPONENT_MOVE_DRAMAS, ...COMMON_PLAYER_MOVE_DRAMAS };
export default COMMON_DRAMA_TABLE;