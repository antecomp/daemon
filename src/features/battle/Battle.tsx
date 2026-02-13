import './ui/styles/battle.css';

// TODO: Convert this opening animation to be fully scripted so we can properly await/time it.
//import './ui/styles/battle-opening-animation.css'

import vtl from './assets/vtl.png';
import vtr from './assets/vtr.png';
import { BattleUIState, BattleUIStateContext, createUIBridgedBattleEngine } from './bridge/battleEngineBridge';
import CornerRect from '@/shared/ui/primitives/corner-rect/CornerRect';
import OpponentStatusBar from './ui/OpponentStatusBar';
import Actionbar from './ui/Actionbar';
import { COMMON_MOVE_LEXICON, PLAYER_MOVE_LEXICON } from '@/features/battle/lexicon/moveLexicon';
import BattleCanvas from './ui/BattleCanvas';
import { BattleRefRegistryCTX } from './animation/uiAnimations/battleUIRefRegistry';
import { createMeltingEffect } from '@/shared/hooks/createMeltEffect';
import OverlayAnimator from './ui/OverlayAnimator';
import { createOverlayAnimationQueue } from './animation/overlayAnimations/overlayAnimationQueue';
import { OpponentProfile, PlayerProfile } from './bridge/battleProfiles';
import ActionMessages from './ui/ActionMessages';
import { BattleOutcome } from '@/core/battle/model/battle';
import CurrentClash from './ui/CurrentClash';
import { createMusicTrack } from '@/core/audio/createMusicTrack';
import OpponentSprite from './ui/OpponentSprite';
import { Show } from 'solid-js';
import InitMessage from './ui/InitMessage';
import { extendLexicon } from './bridge/battleEngineBridge.util';

export default function Battle(props: {
    opponentProfile: OpponentProfile
    playerProfile: PlayerProfile
    onEnd: (outcome: BattleOutcome) => void;
}) {

    const playerLexicon = extendLexicon(PLAYER_MOVE_LEXICON, props.playerProfile.display.lexicon);

    const opponentLexicon = extendLexicon(COMMON_MOVE_LEXICON, props.opponentProfile.display.lexicon);

    const { startMeltAnimation, filterID, filterSVG } = createMeltingEffect();

    const { overlayAnimRequests, requestOverlayAnimation } = createOverlayAnimationQueue();

    const { engine, ...bridge } = createUIBridgedBattleEngine(props.opponentProfile, { opponent: opponentLexicon, player: playerLexicon }, props.onEnd, startMeltAnimation, requestOverlayAnimation);

    createMusicTrack({src: 'PWL/blackscorpionmusic-black-scorpion-music-matrix.mp3'});

    return (
        <BattleRefRegistryCTX.Provider value={{ attachToRegistry: bridge.attachToRegistry }}>
            <BattleUIStateContext.Provider value={{ ...bridge }}>
                {filterSVG}
                <div
                    class="battle-container"
                    style={{ filter: `url(#${filterID})` }}
                    classList={{ "battle-end": bridge.battleUIState() === BattleUIState.END }}
                >
                    <ActionMessages messages={bridge.actionMessages} />
                    <CornerRect ref={(r: HTMLElement) => bridge.attachToRegistry('battleView', r)} class="battle-view" borderSize={2} borderType='solid white' corners={[vtl, vtr]} style={{ 'border-bottom': 'none' }}>
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
                    </CornerRect>
                    <Actionbar
                        lexicon={playerLexicon}
                        executeRound={engine.executeRound}
                        forceBattleEnd={engine.handleBattleEnd}
                        {...bridge}
                    />
                    <CurrentClash moves={bridge.currentClash()} lexicons={{ player: playerLexicon, opponent: opponentLexicon }} />
                    <OpponentSprite
                        {...props.opponentProfile.display}
                    />
                    <OverlayAnimator overlayAnimationRequests={overlayAnimRequests} />
                    <Show when={bridge.battleUIState() === BattleUIState.INIT}>
                        <InitMessage message={props.opponentProfile.display.initMessage ?? "A " + props.opponentProfile.display.name + " attacks!"}/>
                    </Show>
                </div>
            </BattleUIStateContext.Provider>
        </BattleRefRegistryCTX.Provider>
    )
}