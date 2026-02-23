import slash_sfx from '@/assets/sfx/battle/candle.wav';
import deflect_noise from '@/assets/sfx/battle/overwhelm.wav'
import opp_attack_noise from '@/assets/sfx/battle/explosion.wav';
import opponent_pain_sfx from "@/assets/sfx/battle/pain.wav";
import player_pain_sfx from "@/assets/sfx/battle/player_pain.wav"
import overwhelm_sfx from '@/assets/sfx/battle/overwhelma.wav';

import animateAsync from "@/shared/utils/animateAsync";
import { SimpleDramaEffect, DramaTable, PLACES } from "./drama.types";
import { playSound } from '@/core/audio/audio';
import { OverlayAnimationName } from "../animation/overlayAnimations/overlayAnimationDefinitions";
import sleep from "@/shared/utils/sleep";
import { MoveType } from '@/core/battle/model/move.types';
import { defineSideDrama } from './drama';
import { capitalizeWords } from '@/shared/utils/stringUtils';
import battleUIAnimations from '../animation/uiAnimations/battleUIAnimations';
import { Sides } from '@/core/battle/utils/sides.utils';

const COMMON_OPPONENT_MOVE_DRAMAS: DramaTable = {
    'opp-shield': {
        place: PLACES.CLASH_ONE,
        when: ({ moves, postCtx }) =>
            moves.opponent.name == 'defend'
            && postCtx.player.ourMults.outgoing > 0,
        run: async ({ requestOverlayAnimation, appendActionMessage }, { profiles, moves }) => {
            await requestOverlayAnimation('shield');
            if (moves.player.type !== MoveType.Overwhelming) appendActionMessage(profiles.opponent.display.name + " endures your attack!");
        }
    },

    'opp-evade-success': {
        place: PLACES.CLASH_ONE,
        when: ({ moves, postEffectOutcomes }) =>
            moves.opponent.name == 'evade'
            && postEffectOutcomes.opponent?.status == 'success',
        run: async ({ refRegistry, appendActionMessage }, { profiles }) => {
            appendActionMessage(profiles.opponent.display.name + " dodges swiftly! " + profiles.opponent.display.name + " feels invigorated!");
            const oppSprite = refRegistry.opponentSprite;
            if (!oppSprite) return;
            await animateAsync(oppSprite, [{ opacity: 1 }, { opacity: 0.5 }, { opacity: 1 }], { duration: 500 });
        }
    },

    'opp-evade-fail': {
        place: PLACES.CLASH_ONE + 1,
        when: ({ moves, postEffectOutcomes, postCtx }) =>
            moves.opponent.name == 'evade'
            && postEffectOutcomes.opponent?.reason === 'rng'
            && postEffectOutcomes.opponent.status == 'failure'
            && postCtx.opponent.damageTaken > 0,
        run: ({ appendActionMessage }, { profiles }) => appendActionMessage(`${profiles.opponent.display.name} couldn't avoid your attack in time!`)
    },

    'opp-mirror': {
        place: PLACES.CLASH_ONE,
        // When opponent deals damage as result of mirror...
        when: ({ moves, postCtx }) =>
            //plannedMoves.opponent.name == 'mirror' // (fails on repeat, use below)
            moves.opponent.tags?.includes('mirrored')
            && postCtx.opponent.damageDealt > 0,
        run: async ({ requestOverlayAnimation, fufillDramaObligation }) => {
            sleep(500).then(() => playSound(deflect_noise));
            await requestOverlayAnimation('mirror');
            fufillDramaObligation.playerDamage();
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
            await playSound(opp_attack_noise)[0];
            await requestOverlayAnimation('opp-attack');
            fufillDramaObligation.playerDamage();
        },
        preDelay: 300
    },

    'opp-heal': {
        place: PLACES.POST_CLASH - 1,
        when: ({ combatantHistory, combatants }) =>
            //moves.opponent.name == 'heal'
            //&& postEffectOutcomes.opponent?.status == 'success'
            !combatants.opponent.isDead
            && combatantHistory.MoveEnd.opponent.health > combatantHistory.DamagesApplied.opponent.health,
        run: ({ refRegistry }) => {
            const sprite = refRegistry.opponentSprite;
            if (!sprite) return;
            return animateAsync(sprite, [{ filter: 'none' }, { filter: 'contrast(0.5) brightness(2.5)' }, { filter: 'none' }], {
                'iterations': 2,
                'duration': 600
            })
        }
    }
}

const COMMON_PLAYER_MOVE_DRAMAS: DramaTable = {
    'player-slash': {
        place: PLACES.CLASH_ONE,
        // When we attack using repeat or candle, but not mirror.
        when: ({ moves }) =>
            moves.player.name == 'attack'
            && !moves.player.tags?.includes('mirrored'),
        async run({ requestOverlayAnimation, fufillDramaObligation: dramaObligations }, { moves, postCtx, combatantHistory }) {
            const [slashSoundReady, _] = playSound(slash_sfx);
            await slashSoundReady;

            const preparedLevel = combatantHistory.MultipliersComputed.player.statuses['prepared']?.level ?? 0;
            const maniaLevel = combatantHistory.MultipliersComputed.player.statuses['mania']?.level ?? 0;

            const preparedAnimation = (['slash_norm', 'slash_purpose', 'rip'] satisfies OverlayAnimationName[])[preparedLevel] ?? 'slash_majes';
            const slashAnimation =
                preparedLevel > 0
                    ? preparedAnimation
                    : maniaLevel > 0
                        ? 'slash_elag'
                        : moves.player.tags?.includes('repeated')
                            ? 'slash_repeat'
                            : preparedAnimation;

            await requestOverlayAnimation(slashAnimation);

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

    'player-defend': {
        place: PLACES.CLASH_TWO + 1,
        when: ({ moves, postCtx }) =>
            moves.player.name == 'defend'
            && postCtx.opponent.ourMults.outgoing > 0
            && moves.opponent.type !== MoveType.Overwhelming,
        run: ({ appendActionMessage }, { profiles }) => appendActionMessage(`${profiles.player.display.name} braves the hit!`)
    },

    'player-evade-success': {
        place: PLACES.CLASH_TWO + 1,
        when: ({ moves, postEffectOutcomes }) =>
            moves.player.name == 'evade'
            && postEffectOutcomes.player?.status == 'success',
        run: async ({ appendActionMessage }, { profiles }) =>
            appendActionMessage(profiles.player.display.name + " dodges swiftly! " + profiles.player.display.name + " feels invigorated!", 'mania')
    },

    'player-evade-fail': {
        place: PLACES.CLASH_TWO + 1,
        when: ({moves, postEffectOutcomes, postCtx}) =>
            moves.player.name == 'evade'
            && postEffectOutcomes.player?.reason == 'rng'
            && postEffectOutcomes.player.status == 'failure'
            && postCtx.player.damageTaken > 0,
        run: ({appendActionMessage}, {profiles}) => appendActionMessage(`${profiles.player.display.name} couldn't evade in time!`)
    },

    'player-overwhelm': {
        place: PLACES.CLASH_ONE,
        when: ({ moves, postCtx }) =>
            moves.player.name == 'overwhelm'
            && postCtx.player.damageDealt > 0,
        run: ({ requestOverlayAnimation }) => {
            playSound(overwhelm_sfx);
            return requestOverlayAnimation('overwhelm');
        }
    }
}

const SHARED_DRAMAS: DramaTable = {
    ...defineSideDrama('focus', {
        place: PLACES.POST_CLASH,
        when: ({ postEffectOutcomes }, side) => postEffectOutcomes[side]?.reason == 'focus' && postEffectOutcomes[side]?.status == 'failure',
        run: ({ appendActionMessage }, { moves, lexicons, profiles }, side) => {
            appendActionMessage(
                `${profiles[side].display.name} lost focus and was unable to use ${capitalizeWords(lexicons[side][moves[side].name].label)}.`,
                'focus'
            )
        }
    }),

    ...defineSideDrama('prepare', {
        place: PLACES.POST_CLASH,
        when: ({ moves, postEffectOutcomes }, side) =>
            moves[side].name == 'prepare'
            && postEffectOutcomes[side]?.status == 'success'
            && postEffectOutcomes[side]?.reason == 'focus',
        run: ({ appendActionMessage }, { profiles, combatantHistory }, side) => {
            console.log(combatantHistory);
            const prepLevel = combatantHistory.PostEffectResolved[side].statuses.prepared?.level
            if (!prepLevel) return;
            if (prepLevel == 1) {
                appendActionMessage(`${profiles[side].display.name}'s vision narrows.`)
            } else if (prepLevel > 1) {
                appendActionMessage(`${profiles[side].display.name} is ready for anything.`)
            }
        }
    }),

    ...defineSideDrama('heal', {
        place: PLACES.POST_CLASH,
        when: ({ moves, postEffectOutcomes, combatantHistory }, side) =>
            moves[side].name == 'heal'
            && postEffectOutcomes[side]?.status == 'success'
            && combatantHistory.MoveEnd[side].health > combatantHistory.DamagesApplied[side].health,
        run: ({ appendActionMessage }, { profiles, combatantHistory, combatants }, side) => {
            const deltaPercent = Math.round(100 * (combatantHistory.MoveEnd[side].health - combatantHistory.DamagesApplied[side].health) / combatants[side].maxHealth);
            if (side == 'opponent') {
                appendActionMessage(`${profiles.opponent.display.name} heals.`, 'heal')
            } else {
                appendActionMessage(`${profiles.player.display.name} finds her resolve. ${deltaPercent}% of F-CH restored.`, 'heal')
            }
        }
    })
}

const COMMON_DRAMA_TABLE: DramaTable = { ...COMMON_OPPONENT_MOVE_DRAMAS, ...COMMON_PLAYER_MOVE_DRAMAS, ...SHARED_DRAMAS };
export default COMMON_DRAMA_TABLE;

export const DEFAULT_DAMAGE_DRAMAS: Sides<SimpleDramaEffect> = {
    player(deps) {
        playSound(player_pain_sfx);
        // Not awaiting, I think it overlaying on top of other animations looks cool.
        deps.startMeltAnimation?.(true, 20, 0.5);
    },

    opponent(deps) {
        playSound(opponent_pain_sfx);
        battleUIAnimations.damageFlash(deps.refRegistry.opponentSprite);
    }
}
