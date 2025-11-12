import './ui/styles/battle.css';

import './ui/styles/battle-opening-animation.css'

import vtl from './assets/vtl.png';
import vtr from './assets/vtr.png';
import { Accessor, createContext, onMount, useContext } from 'solid-js';
import { createUIBridgedBattleEngine } from './bridge/battleEngineBridge';
import CornerRect from '@/shared/ui/primitives/corner-rect/CornerRect';
import OpponentStatusBar from './ui/OpponentStatusBar';
import Actionbar from './ui/Actionbar';
import { BASE_MOVE_LEXICON, MoveLexicon, PLAYER_BASE_MOVE_LEXICON } from '@/features/battle/lexicon/moveLexicon';
import BattleCanvas from './ui/BattleCanvas';
import { BattleRefRegistryCTX } from './animation/uiAnimations/battleUIRefRegistry';
import { createMeltingEffect } from '@/shared/hooks/createMeltEffect';
import OverlayAnimator from './ui/OverlayAnimator';
import { createOverlayAnimationQueue } from './animation/overlayAnimations/overlayAnimationQueue';
import twoLevelMerge from '@/shared/utils/twoLevelMerge';
import { OpponentProfile, PlayerProfile } from './bridge/battleProfiles';
import ActionMessages from './ui/ActionMessages';
import { BattleOutcome } from '@/core/battle/model/battle';
import CurrentClash from './ui/CurrentClash';

/** UI States for various stages in battle execution, used to conditionally lock some components. */
export enum BattleUIState {
    /** Waiting for user input (building sequence) */
    WAITING, 
    /** User input of correct size, waiting for "execute" */
    READY, 
    /** Running the clashes, animations and whatnot, (round execute) */
    EXECUTING, 
    /** Battle end state, (temporary lock while closing animation plays) */
    END
};

interface BattleUIStateMachine {
    battleUIState: Accessor<BattleUIState>,
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
}

export default function Battle(props: {
    opponentProfile: OpponentProfile
    playerProfile: PlayerProfile
    onEnd: (outcome: BattleOutcome) => void;
}) {

    const playerLexicon = twoLevelMerge(PLAYER_BASE_MOVE_LEXICON, props.playerProfile.display.lexicon);

    // Using two level merge allows opponents to change the label for moves without having to also redeclare stuff
    // like the icon. Is this really the best / most intuitive way? I feel like I could make this code more specific.
    const opponentLexicon = twoLevelMerge(BASE_MOVE_LEXICON as MoveLexicon, props.opponentProfile.display.lexicon);

    const {startMeltAnimation, filterID, filterSVG} = createMeltingEffect();

    const {overlayAnimRequests, requestOverlayAnimation} = createOverlayAnimationQueue();

    const {engine, ...bridge} = createUIBridgedBattleEngine(props.opponentProfile, {opponent: opponentLexicon, player: playerLexicon}, props.onEnd, startMeltAnimation, requestOverlayAnimation);

    onMount(engine.setupRound);

    return (
        <BattleRefRegistryCTX.Provider value={{attachToRegistry: bridge.attachToRegistry}}>
            <BattleUIStateContext.Provider value={{...bridge}}>
                {filterSVG}
                <div 
                    class="battle-container"
                    style={{ filter: `url(#${filterID})` }}
                    classList={{"battle-end": bridge.battleUIState() === BattleUIState.END}}
                >
                    <ActionMessages messages={bridge.actionMessages}/>
                    <CornerRect class="battle-view" borderSize={2} borderType='solid white' corners={[vtl, vtr]} style={{'border-bottom': 'none'}}>
                        <OpponentStatusBar
                            name={props.opponentProfile.display.name}
                            icon={props.opponentProfile.display.icon}
                            lexicon={opponentLexicon}
                            health={bridge.opponentHealthPercentage()}
                            planPreview={bridge.opponentPlanPreview()}
                            currentlyExecutingMoveIndex={bridge.currentlyExecutingMoveIndex}
                        />
                        <BattleCanvas
                            {...props.opponentProfile.display}
                        />
                        <OverlayAnimator overlayAnimationRequests={overlayAnimRequests}/>
                    </CornerRect>
                    <Actionbar
                        lexicon={playerLexicon}
                        executeRound={engine.executeRound} 
                        forceBattleEnd={engine.handleBattleEnd}
                        {...bridge}
                    />
                    <CurrentClash moves={bridge.currentClash()} lexicons={{player: playerLexicon, opponent: opponentLexicon}}/>
                </div>
            </BattleUIStateContext.Provider>
        </BattleRefRegistryCTX.Provider>
    )
}