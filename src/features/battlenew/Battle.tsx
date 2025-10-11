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
import { MoveLexicon } from '@/features/battlenew/lexicon/lexicon.types';
import { BASE_MOVE_LEXICON, PLAYER_BASE_MOVE_LEXICON } from '@/features/battlenew/lexicon/moveLexicon';
import BattleCanvas from './ui/BattleCanvas';
import attachToConsole from '@/devtools/attachToConsole';
import { Point } from '@/shared/types/3d.types';
import { BattleRefRegistryCTX } from './animation/uiAnimations/battleUIRefRegistry';
import { createMeltingEffect } from '@/shared/hooks/createMeltEffect';
import OverlayAnimator from './ui/OverlayAnimator';
import { createOverlayAnimationQueue } from './animation/overlayAnimations/overlayAnimationQueue';
import twoLevelMerge from '@/shared/utils/twoLevelMerge';

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

export interface OpponentProfile {
    display: { /* all the shit for sprite, names, etc here */
        name: string;
        icon: AssetURL
        lexicon: Partial<Partial<MoveLexicon>>

        sprite: AssetURL
        spriteOffset?: Point

        backgroundShader: string;
        backgroundShaderTexture?: AssetURL;
    } 
    
    logic: {
        ai: OpponentAI,
        stats: OpponentStats
    }
}

export interface PlayerProfile {
    display: {
        lexicon:Partial<Partial<MoveLexicon>>
    }    
}

export default function Battle(props: {
    opponentProfile: OpponentProfile
    playerProfile: PlayerProfile
}) {

    // TODO: Change this to a more robust merger of lexicon data so you dont need to redefine everything!
    //const playerLexicon = {...PLAYER_BASE_MOVE_LEXICON, ...props.playerProfile.display.lexicon} as MoveLexicon;
    const playerLexicon = twoLevelMerge(PLAYER_BASE_MOVE_LEXICON, props.playerProfile.display.lexicon);

    //const opponentLexicon = {...BASE_MOVE_LEXICON, ...props.opponentProfile.display.lexicon} as MoveLexicon;
    const opponentLexicon = twoLevelMerge(BASE_MOVE_LEXICON, props.opponentProfile.display.lexicon);

    const {startMeltAnimation, filterID, filterSVG} = createMeltingEffect();

    const {overlayAnimRequests, requestOverlayAnimation} = createOverlayAnimationQueue();

    const {engine, ...bridge} = createUIBridedBattleEngine(props.opponentProfile.logic.ai, props.opponentProfile.logic.stats, opponentLexicon, startMeltAnimation, requestOverlayAnimation);

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