import { Accessor, createContext, useContext } from "solid-js";


/** UI States for various stages in battle execution, used to conditionally lock some components. */
export enum BattleUIState {
    /** Openining Prompt */
    INIT,
    /** Opening Animation */
    OPENING,
    /** Waiting for user input (building sequence) */
    WAITING,
    /** User input of correct size, waiting for "execute" */
    READY,
    /** Running the clashes, animations and whatnot, (round execute) */
    EXECUTING,
    /** Battle end state, (temporary lock while closing animation plays) */
    END,
    /** Player Victory Ending UI */
    FORSAKE
}
interface BattleUIStateMachine {
    battleUIState: Accessor<BattleUIState>;
    setBattleUIState: (newState: BattleUIState) => void;
}

export const BattleUIStateContext = createContext<BattleUIStateMachine>();
/**
 * Hook that wraps useContext(BattleUIStateContext) to subscribe to current BattleUIState.
 *
 * Throws error if context cannot be obtained.
 */

export const useBattleUIState = () => {
    const context = useContext(BattleUIStateContext);
    if (!context) throw new Error("useBattleUIState must be within BattleUIState provider (Battle Component)");
    return context;
};