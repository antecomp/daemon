import { DVOpponentData } from "@/core/battle/engine/battle.types";
import pan_icon from "@/assets/artwork/dæmons/snaek_icon.png"
import pan_sprite from "@/assets/artwork/dæmons/snaek.png"
import vortexShader from "@/shaders/backgrounds/vortex.glsl";
import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";
import stockMoves from "@/core/battle/moves/metas/stockMoves";
import pick from "@/util/pick";

const pantoptes_movebank = {

    // Rename attack to be appropriate to opponent :)
    bite: {
        ...stockMoves.attack,
        displayName: "bite",
    },

    // If we want to have multiple instances of the 
    // same move we need to assign each a unique key for
    // get sequence to track usage.
    bite2: {
        ...stockMoves.attack,
        displayName: "bite",
    },

    // Bulk pull in defaults.
    ...pick(stockMoves, ['idle', 'prepare', 'defend'])

}

export const OPPONENT_PANOPTES: DVOpponentData = {
    name: "Panoptesian Serpent",
    icon: pan_icon,
    sprite: pan_sprite,
    spriteOffset: {
        x: 0,
        y: -25
    },
    backgroundShader: vortexShader,
    maxHealth: 10,

    // Note: getSequence also has access to info about ourselves and the player to make conditional decisions.
    getSequence: () => 
        buildSequenceFromWeightMap(
            // Available Moves
            pantoptes_movebank,

            // Weights indicating likelyhood that some move will succeed another... 
            // f.e let's make him very aggressive. If he attacks once, he'll likely attack again!
            {
                bite: {bite2: 3},
                bite2: {bite: 3},
                prepare: {bite: 3, bite2: 3, defend: 3}
            }
        )   
}