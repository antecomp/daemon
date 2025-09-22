import attachToConsole from "@/devtools/attachToConsole";
import { Actor } from "@/core/battle/engine/actor";
import { DVOpponentData } from "@/core/battle/engine/battle.types";
import { MoveMeta } from "@/core/battle/moves/moves.types";

// later add a T extends for basic expectations.
type StageHook<T> = (CTX: T) => void;

type StageHookap = {
    // stage -> hooks.
}

class BattleEngine {
    private playerDoll: Actor;
    private opponentDoll: Actor;
    private opponentData: DVOpponentData;
    private messageBuffer: string[]  = [];

    // private state: {
    //     stage: ???
    //     opponentSequence: MoveMeta[]
    // }
    
    constructor(od: DVOpponentData) {
        this.opponentData = od;
        this.opponentDoll = new Actor(od.name, od.maxHealth)
        this.playerDoll = new Actor("Arda", 100); // to be gathered from gamestate later.

        // for now, should be a mixin later
        attachToConsole(this, "DG_BATTLE_ENGINE")
    }

    setupRound() {
        // modify opponent sequence state.
        // trigger before execution hooks.
    }

}

// NEED A PLAN TO REIMPLEMENT EVERYTHING INCREMENTALLY, SO I CAN DO THIS WITHOUT HAVING A STROKE.