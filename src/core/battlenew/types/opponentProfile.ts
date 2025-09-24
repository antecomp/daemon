import { AssetURL } from "@/shared/types/misc.types";
import { Combatant } from "./combatant";
import { PlannedMove, MoveMeta } from "./move";
import { Point } from "@/shared/types/3d.types";

// Try to keep UI stuff, including sprites, completely out
// of createBattleEngine. Instead, in our hook, we can
// pass the profile data to the animator system to use
// without it having to float around in the logic portion
// Anim/UI self configure with Profile
// Logic configure with just UI
// Anims/UIs reactions (from earlier configure) utilize Profile data
// to generate their reaction code thatll run.

// Feels a bit silly having an interface with only one property but meh
// any data needed to initialize the opponent combatant.
export interface OpponentStats {
    maxHealth: number // for Combatant constuctor.
    // could also do stuff like initial statuses if u want.
}

export interface OpponentAI {
    // For the UI, we will do a mapping of DynamicMove to presentation data (MoveMeta) by name.
    // keep it all as just logic!
    getSequence: (me: Combatant, player: Combatant) => PlannedMove[];
    preRoundBehavior?: (me: Combatant, player: Combatant, /*ctx: any <- for side effects*/) => void;
    postRoundBehavior?: (me: Combatant, player: Combatant, /*ctx: any <- for side effects*/) => void;
}

export interface OpponentProfile {
    ai: OpponentAI;
    stats: OpponentStats;
    name: string;
    icon: AssetURL;
    sprite: AssetURL;
    spriteOffset?: Point;
    backgroundShader: string;
    backgroundShaderTexture?: AssetURL;

    // consider putting the mapping of move names to MoveMeta here,
    // so it's per-opponent!
}