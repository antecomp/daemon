/** 
 * Generic Moves 
 */

import { ApplyOpponentVulnerable, ExtendOpponentVulnerable } from "./moves.behaviors";
import { Move } from "./moves.types";

/** Observe. Applies (and extends effect of) vulnerability */
const Observe: Move = {
    name: "observe",
    type: "Passive",
    behaviors: {
        preEffect: [ExtendOpponentVulnerable],
        postEffect: [ApplyOpponentVulnerable]
    }
}