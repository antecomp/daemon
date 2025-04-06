import { DVOpponentData } from "@/core/battle/engine/battle.types";
import stockMoves from "@/core/battle/moves/metas/stockMoves";
import pick from "@/util/pick";

import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";
import { ManiaStatus } from "@/core/battle/statuses/statuses";

import debug_angel_icon from "@/assets/artwork/dæmons/debug_angel_icon.png";
import debug_angel_sprite from '@/assets/artwork/dæmons/debug_angel.png';
import basic_grid_bg from '@/assets/artwork/battle_bgs/debug_angel_bg.png';
import testShader from "@/shaders/backgrounds/test.glsl";


const mimicry_movebank = {
    ...pick(stockMoves, ['evade', 'defend', 'repeat', 'mirror', 'attack']),
    mirror2: stockMoves.mirror,
    mirror3: stockMoves.mirror
}

export const OPPONENT_DEBUG_ANGEL: DVOpponentData = {
    name: "::DEBUG_ANGEL::",
    icon: debug_angel_icon,
    //sprite: placeholder_sprite,
    sprite: debug_angel_sprite,
    backgroundShader: testShader,
    backgroundShaderTexture: basic_grid_bg,

    maxHealth: 15,

    getSequence: (me) => {
        // Mimicry looses mirror ability @ low health, resorts to attacking.
        if(me.health < 5) {
            const desperate_movebank = {
                ...pick(stockMoves, ['evade', 'defend', 'repeat', 'attack']),
                attack2: stockMoves.attack,
                attack3: stockMoves.attack
            }

            return buildSequenceFromWeightMap(
                desperate_movebank, {
                    evade: {attack: 3, attack2: 3, attack3: 3}
                } 
            )
        }

        return buildSequenceFromWeightMap(
            mimicry_movebank,

            {
                // Avoid doing mirror several times in a row.
                mirror: {mirror2: 0.5, mirror3: 0.5},
                mirror2: {mirror: 0.5, mirror3: 0.5},
                mirror3: {mirror: 0.5, mirror2: 0.5},

                // Typical strat - Hope for mania
                evade: {attack: 3}
            }
    )},

    // Report phase shift in UI, add buff.
    postRoundBehavior: (me, _player, appendActionMessage) => {
        if(me.health < 5) {
            me.addStatus(new ManiaStatus(999)); // Permenant Buff.
            appendActionMessage(`The ${me.name} has a wild look in their eye!`)
        }
    }
}

