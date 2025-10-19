import './ui/battle.css';

import vtl from './assets/vtl.png';
import vtr from './assets/vtr.png';
import { Accessor, createContext, onMount, useContext } from 'solid-js';
import { createUIBridedBattleEngine } from './bridge/battleEngineBridge';
import CornerRect from '@/shared/ui/primitives/corner-rect/CornerRect';
import OpponentStatusBar from './ui/OpponentStatusBar';
import Actionbar from './ui/Actionbar';
import { BASE_MOVE_LEXICON, PLAYER_BASE_MOVE_LEXICON } from '@/features/battlenew/lexicon/moveLexicon';
import BattleCanvas from './ui/BattleCanvas';
import attachToConsole from '@/devtools/attachToConsole';
import { BattleRefRegistryCTX } from './animation/uiAnimations/battleUIRefRegistry';
import { createMeltingEffect } from '@/shared/hooks/createMeltEffect';
import OverlayAnimator from './ui/OverlayAnimator';
import { createOverlayAnimationQueue } from './animation/overlayAnimations/overlayAnimationQueue';
import twoLevelMerge from '@/shared/utils/twoLevelMerge';
import { OpponentProfile, PlayerProfile } from './bridge/battleProfiles';
import ActionMessages from './ui/ActionMessages';

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

export default function Battle(props: {
    opponentProfile: OpponentProfile
    playerProfile: PlayerProfile
    // onEnd callback please do NOT DO THAT GODAWFUL RESOLVER BY REF GARBAGE!!!
}) {

    const playerLexicon = twoLevelMerge(PLAYER_BASE_MOVE_LEXICON, props.playerProfile.display.lexicon);

    const opponentLexicon = twoLevelMerge(BASE_MOVE_LEXICON, props.opponentProfile.display.lexicon);

    const {startMeltAnimation, filterID, filterSVG} = createMeltingEffect();

    const {overlayAnimRequests, requestOverlayAnimation} = createOverlayAnimationQueue();

    const {engine, ...bridge} = createUIBridedBattleEngine(props.opponentProfile, {opponent: opponentLexicon, player: playerLexicon}, startMeltAnimation, requestOverlayAnimation);

    onMount(
        () => {
            engine.setupRound();
            attachToConsole(engine, "B_ENGINE");
        }
    );

    return (
        <BattleRefRegistryCTX.Provider value={{attachToRegistry: bridge.attachToRegistry}}>
            <BattleUIStateContext.Provider value={{...bridge}}>
                {filterSVG}
                <div 
                    id="battle-container"
                    style={{ filter: `url(#${filterID})` }}
                    classList={{"battle-end": bridge.battleUIState() === BattleUIState.END}}
                >
                    <ActionMessages messages={bridge.actionMessages}/>
                    <CornerRect id="battle-view" borderSize={2} borderType='solid white' corners={[vtl, vtr]}>
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
                        forceBattleResolve={engine.forceBattleResolve}
                        {...bridge}
                    />
                </div>
            </BattleUIStateContext.Provider>
        </BattleRefRegistryCTX.Provider>
    )
}