import { Side } from "../utils/sides.utils";
import { MoveSideEffectOutcome } from "./move.types";

export type ClashLog = ClashLogEntry[]

export type ClashLogEntry =
    | {
        type: "custom";
        key: string;
        payload?: unknown;
    }
    | {
        type: 'heal';
        to: Side;
        capped: boolean
    }
    | {
        type: 'status:add';
        to: Side;
        from: Side;
        statusName: string
        level: number;
        duration: number;
    }
    | {
        type: 'move:outcome';
        side: Side,
        moveName: string,
        result: MoveSideEffectOutcome
        note: string | undefined
    }
    | {
        type: 'mechanic:focus';
        side: Side;
        lost: boolean
    }
    // dont make mania its own mechanic. Instead just read the outcome of evade, or use custom.
// Just rely on postCtx for info like this? It already has a damageDealth and damageTaken thing which is only for the clash, not general.
// | {
//     type: 'damage';
//     from: Side; to: Side;
//     amount: number
// }

