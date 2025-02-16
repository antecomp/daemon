import { createContext, useContext } from "solid-js";

export enum BattleUIState {
    WAITING, READY, EXECUTING
}

interface BattleUIStateMachine {
    battleUIState: () => BattleUIState;
    setBattleUIState: (newState: BattleUIState) => void
}

export const BattleUIStateContext = createContext<BattleUIStateMachine>();
export const useBattleUIState = () => {
    const context = useContext(BattleUIStateContext);
    if (!context) throw new Error("useBattleUIState must be within BattleUIState provider (Battle Component)");
    return context;
}