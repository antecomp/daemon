import './ui/battle.css';
import vtl from './assets/vtl.png';
import vtr from './assets/vtr.png';
import { Accessor, createContext, onMount, useContext } from 'solid-js';
import { createUIBridedBattleEngine } from './bridge/battleEngineBridge';
import { OpponentAI, OpponentStats } from '@/core/battlenew/ai/opponentAI.types';
import CornerRect from '@/shared/ui/primitives/corner-rect/CornerRect';
import { AssetURL } from '@/shared/types/misc.types';
import OpponentStatusBar from './ui/OpponentStatusBar';
import Actionbar from './ui/Actionbar';

export enum BattleUIState {WAITING, READY, EXECUTING, END};

interface BattleUIStateMachine {
    battleUIState: Accessor<BattleUIState>,
    setBattleUIState: (newState: BattleUIState) => void;
}

export const BattleUIStateContext = createContext<BattleUIStateMachine>();

export const useBattleUIState = () => {
    const context = useContext(BattleUIStateContext);
    if (!context) throw new Error("useBattleUIState must be within BattleUIState provider (Battle Component)");
    return context;    
}

interface OpponentProfile {
    display: { /* all the shit for sprite, names, etc here */
        name: string;
        icon: AssetURL
    } 
    
    logic: {
        ai: OpponentAI,
        stats: OpponentStats
    }
}

export default function Battle(props: {
    opp: OpponentProfile
}) {
    const {engine, ...bridge} = createUIBridedBattleEngine(props.opp.logic.ai, props.opp.logic.stats);

    onMount(() => engine.setupRound());

    return (
        <BattleUIStateContext.Provider value={{...bridge}}>
            <div id="battle-container">
                <CornerRect id="battle-view" borderSize={2} borderType='solid white' corners={[vtl, vtr]}>
                    <OpponentStatusBar
                        name={props.opp.display.name}
                        icon={props.opp.display.icon}

                        health={bridge.opponentHealthPercentage()}
                        planPreview={bridge.opponentPlanPreview()}
                    />
                </CornerRect>
                <Actionbar
                    executeRound={engine.executeRound} 
                    forceBattleResolve={engine.forceBattleResolve}
                    {...bridge}
                />
            </div>
        </BattleUIStateContext.Provider>
    )
}