import { createContext, useContext } from "solid-js";

/**
 * State machine for the Battle UI.
 * @state WAITING: Waiting for player input.
 * @state READY: Player has selected a move and is ready to execute
 * @state EXECUTING: Sequence is being executed (animations, damage calculations, etc)
 * @state END: Battle has ended, either by player defeat or victory.
 * 
 * Battle starts in WAITING state. Goes Waiting -> Ready -> Executing -> Back to Waiting (or end)
 */
export enum BattleUIState {
    WAITING, READY, EXECUTING, 
    END // May be uneeded depending on how we handle resolution.
}

/**
 * State machine signal for battle UI.
 * @state WAITING: Waiting for player input.
 * @state READY: Player has selected a move and is ready to execute
 * @state EXECUTING: Sequence is being executed (animations, damage calculations, etc)
 * @state END: Battle has ended, either by player defeat or victory.
 * 
 * Battle starts in WAITING state. Goes Waiting -> Ready -> Executing -> Back to Waiting (or end)
 */
interface BattleUIStateMachine {
    battleUIState: () => BattleUIState;
    setBattleUIState: (newState: BattleUIState) => void
}

export const BattleUIStateContext = createContext<BattleUIStateMachine>();

/**
 * Hook to access the Battle UI state machine. Reference battle.context.ts
 */
export const useBattleUIState = () => {
    const context = useContext(BattleUIStateContext);
    if (!context) throw new Error("useBattleUIState must be within BattleUIState provider (Battle Component)");
    return context;
}