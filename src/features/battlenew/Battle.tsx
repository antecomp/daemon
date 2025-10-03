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
import { MoveLexicon } from '@/core/battlenew/lexicon/lexicon.types';
import { BASE_MOVE_LEXICON } from '@/core/battlenew/lexicon/moveLexicon';

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
        lexicon: Partial<MoveLexicon>
    } 
    
    logic: {
        ai: OpponentAI,
        stats: OpponentStats
    }
}

interface PlayerProfile {
    display: {
        lexicon:Partial<MoveLexicon>
    }    
}

export default function Battle(props: {
    opponentProfile: OpponentProfile
    playerProfile: PlayerProfile
}) {
    const {engine, ...bridge} = createUIBridedBattleEngine(props.opponentProfile.logic.ai, props.opponentProfile.logic.stats);

    onMount(() => engine.setupRound());

    // Unelegant type cast because Partial technically means we can set a value to undefined (overriding BASE). This 'as' ignores that, but
    // relies on us not being a moron. TODO LATER: Research a partialButNotUndefined shit.
    const playerLexicon = {...BASE_MOVE_LEXICON, ...props.playerProfile.display.lexicon} as MoveLexicon;

    const opponentLexicon = {...BASE_MOVE_LEXICON, ...props.opponentProfile.display.lexicon} as MoveLexicon;

    return (
        <BattleUIStateContext.Provider value={{...bridge}}>
            <div id="battle-container">
                <CornerRect id="battle-view" borderSize={2} borderType='solid white' corners={[vtl, vtr]}>
                    <OpponentStatusBar
                        name={props.opponentProfile.display.name}
                        icon={props.opponentProfile.display.icon}
                        lexicon={opponentLexicon}
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