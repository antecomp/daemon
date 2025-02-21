import { DVOpponentData } from "@/core/battle/engine/battle.types";
import { MoveMeta } from "./moves/moves.types";
import pan_icon from "@/assets/artwork/dæmons/snaek_icon.png"
import pan from "@/assets/artwork/dæmons/snaek.png"
import sample_move_icon from "@/components/views/battle/assets/placeholder_move_icon.png"
import { Attack, NothingMove } from "./moves/moves.list";
import vortexShader from "@/shaders/backgrounds/vortex.shader";
import pickRandom from "@/util/pickRandom";

const biteMove: MoveMeta = {
    displayName: "Bite",
    icon: sample_move_icon,
    getMove: Attack
}


const nothingMove: MoveMeta = {
    displayName: "Idle",
    icon: sample_move_icon,
    getMove: {
        name: "nothing",
        type: "Passive",
        //behaviors: {postEffects: [({appendActionMessage}) => {appendActionMessage(`"The Serpent " ${pickRandom<string>(["hisses", "looks at you with their many eyes", "bares their teeth"])}`)}]}
        behaviors: {}
    }
}

// Panoptes will be our opponent friend for this early test :)
// export const sampleDVOpponent: DVOpponent = new DVOpponent("Panoptes", pan_icon, pan, new Actor("Panoptes", 100), [])

export const OPPONENT_PANOPTES: DVOpponentData = {
    name: "Panoptesian Serpent",
    icon: pan_icon,
    sprite: pan,
    moveBin: [biteMove, nothingMove],
    maxHealth: 20,
    getSequence: (_me, _player) => {
        return [biteMove, nothingMove, nothingMove, biteMove, biteMove]
    },
    backgroundShader: vortexShader
}