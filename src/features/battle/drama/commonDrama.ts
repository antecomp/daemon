import slash_sfx from '@/assets/sfx/battle/candle.wav';
import deflect_noise from '@/assets/sfx/battle/overwhelm.wav'
import opp_attack_noise from '@/assets/sfx/battle/explosion.wav';

import animateAsync from "@/shared/utils/animateAsync";
import { DramaTable, PLACES } from "./drama.types";
import { playSound, playSoundOnReady } from "@/shared/utils/playSound";
import { AvailableOverlayAnimationNames } from "../animation/overlayAnimations/overlayAnimationDefinitions";
import sleep from "@/shared/utils/sleep";
import { MoveType } from '@/core/battle/model/move.types';
import { defineSideDrama } from './drama';

const COMMON_OPPONENT_MOVE_DRAMAS: DramaTable = {
    'opp-shield': {
        place: PLACES.CLASH_ONE,
        when: ({ moves, postCtx }) =>
            moves.opponent.name == 'defend'
            && postCtx.player.ourMults.outgoing > 0
            && moves.player.type !== MoveType.Overwhelming,
        run: ({ requestOverlayAnimation, appendActionMessage }, { profiles }) => {
            appendActionMessage(profiles.opponent.display.name + " endures your attack!");
            return requestOverlayAnimation('shield')
        }
    },

    'opp-evade': {
        place: PLACES.CLASH_ONE,
        when: ({ moves }) =>
            moves.opponent.name == 'evade',
        //&& postEffectOutcomes.opponent?.status == 'success',
        run: async ({ refRegistry, appendActionMessage }, { profiles, postEffectOutcomes, postCtx }) => {
            if (postEffectOutcomes.opponent?.status == 'success') {
                appendActionMessage(profiles.opponent.display.name + " dodges swiftly! " + profiles.opponent.display.name + " feels invigorated!");
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
                appendActionMessage(`${profiles.opponent.display.name} couldn't avoid your attack in time!`)
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
        run: async ({ requestOverlayAnimation, appendActionMessage }, { profiles }) => {
            await requestOverlayAnimation('observe');
            appendActionMessage(profiles.player.display.name + " feels watched.")
        },
        preDelay: 1000
    },

    'opp-attack': {
        place: PLACES.CLASH_TWO,
        when: ({ moves }) => moves.opponent.name == 'attack' && !moves.opponent.tags?.includes('mirrored'),
        run: async ({ requestOverlayAnimation, fufillDramaObligation }, { moves }) => {
            // Add a delay to give a feeling of retaliation here.
            if (
                moves.player.type == MoveType.Aggressive &&
                !moves.player.tags?.includes('mirrored')
            ) {
                await sleep(500);
            }
            await playSoundOnReady(opp_attack_noise);
            await requestOverlayAnimation('opp-attack');
            fufillDramaObligation.playerDamage();
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
        async run({ requestOverlayAnimation, fufillDramaObligation: dramaObligations }, { combatants, moves, postCtx, combatantHistory}) {
            await playSoundOnReady(slash_sfx);

            // TODO: Change how this works. Prep should take precedence over other anim types.
            if (combatants.player.getStatusLevel('mania') > 0) {
                await requestOverlayAnimation('slash_elag');
            } else if (moves.player.tags?.includes('repeated')) {
                await requestOverlayAnimation('slash_repeat');
            } else {
                const preparedLevel = combatantHistory.MultipliersComputed.player.statuses['prepared']?.level ?? 0;
                await requestOverlayAnimation((['slash_norm', 'slash_purpose', 'slash_majes'] satisfies AvailableOverlayAnimationNames[])[preparedLevel] ?? 'slash_majes');
            }

            // ugh -- don't early run damage of opponent blocks. Looks better if we wait for their defense anim to finish.
            if (postCtx.opponent.ourMults.incoming < 1) return;

            // Run opponent hit right after this
            dramaObligations.opponentDamage();
        }
    },

    // Allows us to very easily give the same move a different actions for the player.
    // Even for moves that we only get through mirroring.
    'player-observe': {
        place: PLACES.POST_CLASH,
        when: ({ moves }) => moves.player.name == 'observe',
        run: ({ appendActionMessage }, { profiles }) =>
            appendActionMessage(`${profiles.player.display.name} keenly observes ${profiles.opponent.display.name}`)
    },

    // Todo: move to common.
    'player-heal': {
        place: PLACES.POST_CLASH,
        when: ({ moves, postEffectOutcomes, combatantHistory }) =>
            moves.player.name == 'heal'
            && postEffectOutcomes.player?.status == 'success'
            && combatantHistory.MoveEnd.player.health > combatantHistory.DamagesApplied.player.health,
        run: ({ appendActionMessage }, { profiles, combatantHistory, combatants }) => {
            const deltaPercent = Math.round(100 * (combatantHistory.MoveEnd.player.health - combatantHistory.DamagesApplied.player.health) / combatants.player.maxHealth);
            appendActionMessage(`${profiles.player.display.name} finds her resolve. ${deltaPercent}% of F-CH restored.`)
        }
    },

    'player-defend': {
        place: PLACES.CLASH_TWO + 1,
        when: ({ moves, postCtx }) =>
            moves.player.name == 'defend'
            && postCtx.opponent.ourMults.outgoing > 0
            && moves.opponent.type !== MoveType.Overwhelming,
        run: ({ appendActionMessage }, { profiles }) => appendActionMessage(`${profiles.player.display.name} braves the hit!`)
    },

    'player-evade': {
        place: PLACES.CLASH_TWO,
        when: ({ moves }) =>
            moves.player.name == 'evade',
        //&& postEffectOutcomes.opponent?.status == 'success',
        run: async ({ appendActionMessage }, { profiles, postEffectOutcomes, postCtx }) => {
            if (postEffectOutcomes.player?.status == 'success') {
                appendActionMessage(profiles.player.display.name + " dodges swiftly! " + profiles.player.display.name + " feels invigorated!");
            }

            // This should only fire if it fails for RNG and we took damage
            // failure due to overwhelm should have a differet reason.
            if (
                postEffectOutcomes.opponent?.reason == 'rng'
                && postEffectOutcomes.opponent.status == 'failure'
                && postCtx.opponent.damageTaken > 0
            ) {
                appendActionMessage(`${profiles.player.display.name} couldn't evade in time!`)
            }
        }
    },
}

const SHARED_DRAMAS: DramaTable = {
    ...defineSideDrama('focus', {
        place: PLACES.POST_CLASH,
        when: ({ postEffectOutcomes }, side) => postEffectOutcomes[side]?.reason == 'focus' && postEffectOutcomes[side]?.status == 'failure',
        run: ({ appendActionMessage }, { moves, lexicons, profiles }, side) => {
            appendActionMessage(
                `${profiles[side].display.name} lost focus and was unable to use ${lexicons[side][moves[side].name].label}.`
            )
        }
    }),
}


const COMMON_DRAMA_TABLE: DramaTable = { ...COMMON_OPPONENT_MOVE_DRAMAS, ...COMMON_PLAYER_MOVE_DRAMAS, ...SHARED_DRAMAS };
export default COMMON_DRAMA_TABLE;