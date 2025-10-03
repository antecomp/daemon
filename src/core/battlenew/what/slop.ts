// WHERE DO I PUT THIS FILE LOL???

import { attack, defend, evade, heal, overwhelm, prepare } from "../moves/moves";
import { mirrorPlan, planMove, repeatPlan } from "../moves/plannedMoves";

// This will eventually be in some global store of equipted moves or similar.
export const playerRunes = {
    attack: planMove(attack),
    defend: planMove(defend),
    evade: planMove(evade),
    overwhelm: planMove(overwhelm),
    mirror: mirrorPlan,
    repeat: repeatPlan,
    heal: planMove(heal),
    prepare: planMove(prepare)
}

export const playerRuneNames = Object.keys(playerRunes) as (keyof typeof playerRunes)[];