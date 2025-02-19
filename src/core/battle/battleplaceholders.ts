import { DVOpponentData } from "@/core/battle/engine/battle.types";
import { MoveData } from "./moves/moves.types";
import pan_icon from "@/assets/artwork/dæmons/snaek_icon.png"
import pan from "@/assets/artwork/dæmons/snaek.png"
import sample_move_icon from "@/components/views/battle/assets/placeholder_move_icon.png"
import { Attack, NothingMove } from "./moves/moves.list";
import vortexShader from "@/shaders/backgrounds/vortex.shader";

// Custom name example
const biteMove: MoveData = {
    displayName: "Bite",
    icon: sample_move_icon,
    ...Attack
}

// Shit like this should be moved to a general place to reuse
const nothingMove: MoveData = {
    displayName: "Idle",
    icon: sample_move_icon,
    ...NothingMove
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
        console.log(this);
        return [biteMove, nothingMove, nothingMove, biteMove, biteMove]
    },
    backgroundShader: vortexShader
}