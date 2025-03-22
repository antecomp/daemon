import { DVOpponentData } from "@/core/battle/engine/battle.types";
import { MoveMeta, MovePerspective, MoveType } from "../core/battle/moves/moves.types";
import pan_icon from "@/assets/artwork/dæmons/snaek_icon.png"
import pan_sprite from "@/assets/artwork/dæmons/snaek.png"
import sample_move_icon from "@/components/views/battle/assets/placeholder_move_icon.png"
import prae_icon from '@/core/battle/moves/icons/PRAETORIAN.png'
import { Attack, Defend, NothingMove, Prepare } from "../core/battle/moves/moves.list";
import vortexShader from "@/shaders/backgrounds/vortex.shader";
import { requestOverlayAnimation } from "../core/battle/animation/requestOverlayAnim";
import { buildSequenceFromWeightMap } from "@/core/battle/ai/weightedSequenceAI";


// Redeclaring these moves to override their names and icons.
const biteMove: MoveMeta = {
    displayName: "Bite",
    icon: sample_move_icon,
    getMove: Attack,
}

const nothingMove: MoveMeta = {
    displayName: "Idle",
    icon: sample_move_icon,
    getMove: NothingMove
}

const prepareMove: MoveMeta = {
    displayName: "Poise",
    icon: sample_move_icon,
    getMove: Prepare
}

const shieldMove: MoveMeta = {
    displayName: "Guard",
    icon: prae_icon,
    getMove: {
        ...Defend, // <- Inherit default behavior of defend...
        animations: { // <- But then we can override it with new animations!
            pre: [{
                priority: 1,
                execute: async ({opponent, index, movePerspective}) => {
                    // Close enough approximation, we defend when we anticipate an aggressive move.
                    if(movePerspective == MovePerspective.Opponent) {
                        if (opponent.currentSequence[index].type === MoveType.Aggressive) {
                            await requestOverlayAnimation("shield", [0,0]);
                        }
                    } else {
                        //alert("Player used shield move via mirror. No anim.")
                    }
                }
            }]
        }
    }
}

export const OPPONENT_PANOPTES: DVOpponentData = {
    name: "Panoptesian Serpent",
    icon: pan_icon,
    sprite: pan_sprite,
    backgroundShader: vortexShader,
    //moveBin: [biteMove, nothingMove],
    maxHealth: 10,
    getSequence: () => { // getSequence also has access to info about ourselves and the player to make conditional decisions.
        return buildSequenceFromWeightMap(
            // Available Moves
            {
                biteMove, nothingMove, prepareMove, shieldMove, 
                // Duplicate move instances will need a unique key...
                bite2: biteMove,
            },
        
            // Map from moves to how likely other moves are of succeeding it
            {
                prepareMove: {biteMove: 3, bite2: 3, shieldMove: 2},
                biteMove: {bite2: 3},
                // Other move mappings should default to all weights of 1
            }
        );
    },
}