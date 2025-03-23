import { DVOpponentData } from "@/core/battle/engine/battle.types";
import stockMoves from "@/core/battle/moves/metas/stockMoves";
import pick from "@/util/pick";

import mimicry_icon from "@/assets/artwork/dæmons/mimicry_icon.png"
import mimicry_sprite from "@/assets/artwork/dæmons/mimicry.png"
import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";
import distortedGridShader from "@/shaders/backgrounds/disgrid.shader";

const mimicry_movebank = {
    ...pick(stockMoves, ['evade', 'defend', 'repeat', 'mirror', 'attack']),
    mirror2: stockMoves.mirror,
    mirror3: stockMoves.mirror
}

export const OPPONENT_MIMICRY: DVOpponentData = {
    name: "Fractured Mimicry",
    icon: mimicry_icon,
    sprite: mimicry_sprite,
    backgroundShader: distortedGridShader,
    maxHealth: 15,

    getSequence: () => buildSequenceFromWeightMap(
        mimicry_movebank, {}
    )
}

