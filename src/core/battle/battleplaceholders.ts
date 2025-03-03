import { DVOpponentData } from "@/core/battle/engine/battle.types";
import { MoveMeta } from "./moves/moves.types";
import pan_icon from "@/assets/artwork/dæmons/snaek_icon.png"
import pan from "@/assets/artwork/dæmons/snaek.png"
import sample_move_icon from "@/components/views/battle/assets/placeholder_move_icon.png"
import prae_icon from '@/core/battle/moves/icons/PRAETORIAN.png'
import { Attack, Defend, NothingMove, Prepare } from "./moves/moves.list";
import vortexShader from "@/shaders/backgrounds/vortex.shader";
import { shuffleArray } from "@/util/shuffle";
import { requestOverlayAnimation } from "./animation/useOverlayAnim";

const biteMove: MoveMeta = {
    displayName: "Bite",
    icon: sample_move_icon,
    getMove: {...Attack, animations: {}},
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
        ...Defend,
        animations: {
            pre: [{
                priority: 1,
                execute: async () => {
                    await requestOverlayAnimation("shield", [0,0]);
                }
            }]
        }
    }
}

// Panoptes will be our opponent friend for this early test :)
// export const sampleDVOpponent: DVOpponent = new DVOpponent("Panoptes", pan_icon, pan, new Actor("Panoptes", 100), [])

export const OPPONENT_PANOPTES: DVOpponentData = {
    name: "Panoptesian Serpent",
    icon: pan_icon,
    sprite: pan,
    //moveBin: [biteMove, nothingMove],
    maxHealth: 20,
    getSequence: (_me, _player) => {
        return shuffleArray([biteMove, shieldMove, prepareMove, biteMove, nothingMove])
    },
    backgroundShader: vortexShader
}