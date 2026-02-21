import { OpponentProfile } from "@/features/battle/bridge/battleProfiles";
import sprite from '@/assets/artwork/dæmons/mysteryman.png';
import icon from '@/assets/artwork/dæmons/debug_angel_icon.png'
import backgroundShader from '@/assets/background-shaders/fractal.glsl'
import { COMMON_PLANNED_MOVES } from "@/core/battle/moves/plannedMoves";
import pick from "@/shared/utils/pick";
import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";
import { AssetURL } from "@/shared/types/misc.types";
import battleUIAnimations from "@/features/battle/animation/uiAnimations/battleUIAnimations";
import { playSound } from "@/core/audio/audio";
import pickRandom from "@/shared/utils/pickRandom";

import death_sound from '@/assets/sfx/battle/yeouch.ogg';
import animateAsync from "@/shared/utils/animateAsync";
//import { COMMON_OVERLAY_ANIMATION_DEFINITIONS } from "@/features/battle/animation/overlayAnimations/overlayAnimationDefinitions";

const OPPONENT_PAIN_IMPORT = import.meta.glob<AssetURL>('@/assets/sfx/battle/yeah/*.ogg', {
    eager: true,
    query: '?url',
    import: 'default'
}) as Record<string, AssetURL>

const OPPONENT_PAIN_SOUNDS: AssetURL[] = [];
for (const [_k, i] of Object.entries(OPPONENT_PAIN_IMPORT)) {
    OPPONENT_PAIN_SOUNDS.push(i)
}

const MOVESET = { ...pick(COMMON_PLANNED_MOVES, ['attack', 'defend', 'evade', 'idle', 'prepare', 'repeat']) };


export const OPPONENT_MYSTERYMAN: OpponentProfile = {
    display: {
        sprite, icon, backgroundShader,
        spriteOffset: {x: 25, y: 0},
        name: "Mystery Man",
        lexicon: {
            'prepare': { 'label': 'aim' },
            'attack': { 'label': 'shoot' }
        },
        initMessage: "A Mysterious Man racks his shotgun!",
        damageDrama(deps) {
            playSound(pickRandom(OPPONENT_PAIN_SOUNDS));
            battleUIAnimations.damageFlash(deps.refRegistry.opponentSprite);
            deps.requestOverlayAnimation('test');
        },
        async deathDrama(deps) {
            const sprite = deps.refRegistry.opponentSprite;
            if (!sprite) return;
            playSound(death_sound);
            sprite.style.transformOrigin = 'center left';
            await animateAsync(sprite, [{rotate: '0deg'}, {rotate: '90deg'}], {duration: 1500, fill: 'forwards'});
            await battleUIAnimations.fadeToBlackAndTransparent(sprite);
        },

        // Test
        // overlayAnimationsTable: {
        //     'opp-attack': COMMON_OVERLAY_ANIMATION_DEFINITIONS.observe,
        //     'test': COMMON_OVERLAY_ANIMATION_DEFINITIONS.slash_elag
        // }
    },
    logic: {
        ai: { getSequence: () => buildSequenceFromWeightMap(MOVESET, { 'prepare': { 'attack': 3 } }) },
        stats: { maxHealth: 12 }
    }
}