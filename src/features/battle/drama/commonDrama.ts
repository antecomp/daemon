import slash_sfx from '@/assets/sfx/battle/candle.wav';
import deflect_noise from '@/assets/sfx/battle/overwhelm.wav'
import opp_attack_noise from '@/assets/sfx/battle/explosion.wav';

import animateAsync from "@/shared/utils/animateAsync";
import { DramaTable, PLACES } from "./drama.types";
import { playSound } from "@/shared/utils/playSound";
import { AvailableOverlayAnimationNames } from "../animation/overlayAnimations/overlayAnimationDefinitions";
import sleep from "@/shared/utils/sleep";
import { MoveType } from '@/core/battle/model/move.types';

const COMMON_OPPONENT_MOVE_DRAMAS: DramaTable = {
    'opp-focus': {
        place: PLACES.CLASH_ONE,
        when: ({ postEffectOutcomes }) =>
            postEffectOutcomes.opponent?.status == 'failure'
            && postEffectOutcomes.opponent?.reason == 'focus',
        run: ({ appendActionMessage }, { opponentProfile, moves, lexicons }) =>
            appendActionMessage(`Broke the focus for ${opponentProfile.display.name}! Prevent their ${lexicons.opponent?.[moves.opponent.name].label}`)
    },

    'opp-shield': {
        place: PLACES.CLASH_ONE,
        when: ({ moves, postCtx }) =>
            moves.opponent.name == 'defend'
            && postCtx.player.ourMults.outgoing > 0
            && moves.player.type !== MoveType.Overwhelming,
        run: ({ requestOverlayAnimation, appendActionMessage }, { opponentProfile }) => {
            appendActionMessage(opponentProfile.display.name + " endures your attack!");
            return requestOverlayAnimation('shield')
        }
    },

    'opp-evade': {
        place: PLACES.CLASH_ONE,
        when: ({ moves }) =>
            moves.opponent.name == 'evade',
        //&& postEffectOutcomes.opponent?.status == 'success',
        run: async ({ refRegistry, appendActionMessage }, { opponentProfile, postEffectOutcomes, postCtx }) => {
            if (postEffectOutcomes.opponent?.status == 'success') {
                appendActionMessage(opponentProfile.display.name + " dodges swiftly! " + opponentProfile.display.name + " feels invigorated!");
                const oppSprite = refRegistry.opponentSprite;
                if (!oppSprite) return;
                // Could even animate it shifting to one direction here.
                await animateAsync(oppSprite, [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }], { duration: 500 });
            }

            // This should only fire if it fails for RNG and we took damage
            // failure due to overwhelm should have a differet reason.
            if (
                postEffectOutcomes.opponent?.reason == 'rng'
                && postEffectOutcomes.opponent.status == 'failure'
                && postCtx.opponent.damageTaken > 0
            ) {
                appendActionMessage(`${opponentProfile.display.name} couldn't avoid your attack in time!`)
            }
        }
    },

    'opp-mirror': {
        place: PLACES.CLASH_ONE,
        // When opponent deals damage as result of mirror...
        when: ({ moves, postCtx }) =>
            //plannedMoves.opponent.name == 'mirror' // (fails on repeat, use below)
            moves.opponent.tags?.includes('mirrored')
            && postCtx.opponent.damageDealt > 0,
        run: async ({ requestOverlayAnimation, fufillDramaObligation: dramaObligations }) => {
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
    },

    'opp-attack': {
        place: PLACES.CLASH_TWO,
        when: ({moves}) => moves.opponent.name == 'attack' && !moves.opponent.tags?.includes('mirrored'),
        run: async ({requestOverlayAnimation}, {moves}) => {
            // Add a delay to give a feeling of retaliation here.
            if(
                moves.player.type == MoveType.Aggressive &&
                !moves.player.tags?.includes('mirrored')
            ) {
                await sleep(500);
            }
            playSound(opp_attack_noise);
            await requestOverlayAnimation('opp-attack');
        }
    }
}

const COMMON_PLAYER_MOVE_DRAMAS: DramaTable = {
    'player-slash': {
        place: PLACES.CLASH_ONE,
        // When we attack using repeat or candle, but not mirror.
        when: ({ moves, plannedMoves }) =>
            plannedMoves.player.name !== 'mirror'
            && moves.player.name == 'attack',
        async run({ requestOverlayAnimation, fufillDramaObligation: dramaObligations }, { combatants, moves }) {
            playSound(slash_sfx);

            // TODO: Change how this works. Prep should take precedence over other anim types.
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
            appendActionMessage(`${playerProfile.display.name} keenly observes ${opponentProfile.display.name}`)
    },

    // TODO: How do we indicate the amount healed? Maybe we don't?
    // Perhaps snapshots should also be of the combatants to diff?
    // Or use the event stack idea where the combatant class can notify these calls.
    'player-heal': {
        place: PLACES.POST_CLASH,
        when: ({ moves, postEffectOutcomes }) =>
            moves.player.name == 'heal'
            && postEffectOutcomes.player?.status == 'success',
        run: ({ appendActionMessage }, { playerProfile }) => appendActionMessage(`${playerProfile.display.name} ` + ' finds her resolve. F-CH restored.')
    },

    'player-defend': {
        place: PLACES.CLASH_TWO + 1,
        when: ({moves, postCtx}) =>
            moves.player.name == 'defend'
            && postCtx.opponent.ourMults.outgoing > 0
            && moves.opponent.type !== MoveType.Overwhelming,
        run: ({appendActionMessage}, { playerProfile }) => appendActionMessage(`${playerProfile.display.name} braves the hit!`)
    }
}



const COMMON_DRAMA_TABLE: DramaTable = { ...COMMON_OPPONENT_MOVE_DRAMAS, ...COMMON_PLAYER_MOVE_DRAMAS };
export default COMMON_DRAMA_TABLE;