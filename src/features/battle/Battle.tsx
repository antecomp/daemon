import './ui/styles/battle.css';

import vtl from './assets/vtl.png';
import vtr from './assets/vtr.png';
import { createUIBridgedBattleEngine } from './bridge/battleEngineBridge';
import { BattleUIState, BattleUIStateContext } from "./bridge/battleUIState";
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
import OpponentSprite from './ui/OpponentSprite';
import { Show } from 'solid-js';
import InitMessage from './ui/InitMessage';
import { extendLexicon } from './bridge/battleEngineBridge.util';
import { makeSidesMap } from '@/core/battle/utils/sides.utils';
import Forsake from './ui/Forsake';
import { createMusicTrack } from '@/core/audio/createMusicTrack';

export default function Battle(props: {
    opponentProfile: OpponentProfile
    playerProfile: PlayerProfile
    onEnd: (outcome: BattleOutcome) => void;
    onStart?: () => void;
    skipOpeningAnimation?: boolean
}) {

    const playerLexicon = extendLexicon(PLAYER_MOVE_LEXICON, props.playerProfile.display.lexicon);

    const opponentLexicon = extendLexicon(COMMON_MOVE_LEXICON, props.opponentProfile.display.lexicon);

    const { startMeltAnimation, filterID, filterSVG } = createMeltingEffect();

    const { overlayAnimRequests, requestOverlayAnimation } = createOverlayAnimationQueue();

    const { engine, ...bridge } = createUIBridgedBattleEngine(
        {
            startMeltAnimation, 
            requestOverlayAnimation
        },
        {
            lexicons: makeSidesMap(playerLexicon, opponentLexicon), profiles: {player: props.playerProfile, opponent: props.opponentProfile}
        }, 
        {
            onStart: props.onStart,
            onEnd: props.onEnd, 
            skipOpeningAnimation: props.skipOpeningAnimation
        }
    );

    createMusicTrack({src: 'PWL/battle.mp3'});

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
                        forceBattleEnd={engine.forceBattleEnd}
                        {...bridge}
                    />
                    <CurrentClash moves={bridge.currentClash()} lexicons={{ player: playerLexicon, opponent: opponentLexicon }} />
                    <OpponentSprite
                        {...props.opponentProfile.display}
                    />
                    <OverlayAnimator overlayAnimationRequests={overlayAnimRequests} overlayAnimTableOverrides={props.opponentProfile.display.overlayAnimationsTable} />
                    <Show when={bridge.battleUIState() === BattleUIState.INIT}>
                        <InitMessage message={props.opponentProfile.display.initMessage ?? "A " + props.opponentProfile.display.name + " attacks!"}/>
                    </Show>
                    <Show when={bridge.battleUIState() == BattleUIState.FORSAKE}>
                        <Forsake forsake={bridge.forsake}/>
                    </Show>
                </div>
            </BattleUIStateContext.Provider>
        </BattleRefRegistryCTX.Provider>
    )
}