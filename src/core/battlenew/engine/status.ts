import { AssetURL } from "@/shared/types/misc.types";
import { MultiplierSet } from "./battle.types";

export abstract class Status {
    type: string;
    icon?: AssetURL;
    duration: number;

    constructor(type: string, duration: number = 1, icon?: AssetURL) {
        this.type = type;
        this.duration = duration;
        this.icon = icon;
    }

    tick() {
        this.duration--;
    }

    abstract getStatusMultipliers(level: number): MultiplierSet;

    // omitting pre/post effect stuff as we never used it. Feel free to add LATER.
}