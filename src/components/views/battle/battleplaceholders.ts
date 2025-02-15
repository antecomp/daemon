import { DVOpponentData, MoveData } from "@/core/battle/battle.types";
import pan_icon from "@/assets/artwork/dæmons/snaek_icon.png"
import pan from "@/assets/artwork/dæmons/snaek.png"
import sample_move_icon from "@/components/views/battle/assets/placeholder_move_icon.png"
import { AggressiveMove, NothingMove } from "@/core/battle/moves";

// Custom name example
const biteMove: MoveData = {
    displayName: "Bite",
    icon: sample_move_icon,
    instance: new AggressiveMove()
}

// Shit like this should be moved to a general place to reuse
const nothingMove: MoveData = {
    displayName: "Idle",
    icon: sample_move_icon,
    instance: NothingMove
}

// Panoptes will be our opponent friend for this early test :)
// export const sampleDVOpponent: DVOpponent = new DVOpponent("Panoptes", pan_icon, pan, new Actor("Panoptes", 100), [])

export const OPPONENT_PANOPTES: DVOpponentData = {
    name: "Panoptes",
    icon: pan_icon,
    sprite: pan,
    moveBin: [biteMove, nothingMove],
    maxHealth: 100,
    getSequence: (_me, _player) => {
        return [biteMove, nothingMove, nothingMove, biteMove, biteMove]
    }
}