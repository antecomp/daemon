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
        name: "Mystery Man",
        lexicon: {
            'prepare': { 'label': 'aim' },
            'attack': { 'label': 'shoot' }
        },
        initMessage: "A Mysterious Man racks his shotgun!",
        damageDrama(deps) {
            playSound(pickRandom(OPPONENT_PAIN_SOUNDS));
            battleUIAnimations.damageFlash(deps.refRegistry.opponentSprite);
        }
    },
    logic: {
        ai: {getSequence: () => buildSequenceFromWeightMap(MOVESET, {'prepare': {'attack': 3}})},
        stats: {maxHealth: 15}
    }
}