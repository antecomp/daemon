import { DVOpponentData } from "@/core/battle/engine/battle.types";
import stockMoves from "@/core/battle/moves/metas/stockMoves";
import pick from "@/utils/pick";

import anth_sprite from "@/assets/artwork/dæmons/anthousai.png";
import anth_icon from "@/assets/artwork/dæmons/debug_angel_icon.png"

import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";
import bgshader from '@/features/battle/backgrounds/twoblend.glsl'
import bgtex from "@/assets/placeholders/eyes.png"

const anth_movebank = pick(stockMoves, ['evade', 'defend', 'repeat', 'attack', 'prepare', 'idle', 'heal']);

export const OPPONENT_ANTHOUSAI: DVOpponentData = {
    name: "ANTHOUSAI",
    icon: anth_icon,
    sprite: anth_sprite,
    backgroundShader: bgshader,
    backgroundShaderTexture: bgtex,
    maxHealth: 10,
    getSequence: () => buildSequenceFromWeightMap(
        anth_movebank, 
        {
            // Make mildly aggresive when prepared.
            prepare: {attack: 2},

            // Discourage being defensive multiple times
            evade: {defend: 0.5},
            defend: {evade: 0.5}
        }
    )
}