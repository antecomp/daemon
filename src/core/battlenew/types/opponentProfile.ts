import { AssetURL } from "@/shared/types/misc.types";
import { Combatant } from "./combatant";
import { MoveMeta } from "./move";
import { Point } from "@/shared/types/3d.types";

// Try to keep UI stuff, including sprites, completely out
// of createBattleEngine. Instead, in our hook, we can
// pass the profile data to the animator system to use
// without it having to float around in the logic portion
// Anim/UI self configure with Profile
// Logic configure with just UI
// Anims/UIs reactions (from earlier configure) utilize Profile data
// to generate their reaction code thatll run.


export interface OpponentAI {
    maxHealth: number // for Combatant constuctor.
    getSequence: (me: Combatant, player: Combatant) => MoveMeta[];
    preRoundBehavior?: (me: Combatant, player: Combatant, /*ctx: any <- for side effects*/) => void;
    postRoundBehavior?: (me: Combatant, player: Combatant, /*ctx: any <- for side effects*/) => void;
}

export interface OpponentProfile {
    ai: OpponentAI;
    name: string;
    icon: AssetURL;
    sprite: AssetURL;
    spriteOffset?: Point;
    backgroundShader: string;
    backgroundShaderTexture?: AssetURL;
}