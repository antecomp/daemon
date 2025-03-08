import { onMount, Show } from 'solid-js';
import './ui/battle.css'
import CornerRect from '@/components/util/corner-rect/CornerRect';
import vtl from './assets/vtl.png'
import vtr from './assets/vtr.png'
import OppStatusBar from './ui/OppStatusbar';
import Actionbar from './ui/Actionbar';
import { DVOpponentData } from '@/core/battle/engine/battle.types';
import { BattleUIState, BattleUIStateContext } from '@/core/battle/engine/battle.context';
import { useBattleLogic } from '@/core/battle/engine/battle.logic';
import BattleCanvas from './ui/BattleCanvas';
import ActionMessages from './ui/ActionMessages';
import { registerBattleUIRef } from './ui/refRegistry';

interface BattleProps {
    opponentData: DVOpponentData
}

export default function Battle(props: BattleProps) {

    let mainUIRef: HTMLDivElement | undefined = undefined;
    onMount(() => {
        registerBattleUIRef('mainUI', mainUIRef);
    })

    // Hook with a bigass return to handle battle logic and pass back needed UI changes.
    const { 
        playerMults, opponentMults, 
        battleUIState, setBattleUIState, 
        player, opponent, 
        setupRound, executeRound, 
        insight, 
        currentStatuses, 
        actionMessages,
        battleResultPromise
    } = useBattleLogic(props.opponentData);

    onMount(() => {
        setupRound();

        // This will likely run a CB provided as a prop for resolution.
        battleResultPromise.then((result) => {
            if(result == "player") {
                alert("you are winner.");
            }
            if(result == "opponent") {
                alert("you are loser.");
            }
        });
    });

    return (
        <BattleUIStateContext.Provider value={{battleUIState, setBattleUIState}}>
            <div id="battle-container" ref={mainUIRef}>
                <ActionMessages messages={actionMessages}/>
                <CornerRect id="battle-view" borderSize={2} borderType='solid white' corners={[vtl, vtr]}>
                    <OppStatusBar
                        name={opponent.name.toUpperCase()}
                        health={opponent.health / props.opponentData.maxHealth * 100}
                        icon={props.opponentData.icon}
                        sequenceHint={insight()}
                    />
                    <BattleCanvas sprite={props.opponentData.sprite} fragmentShader={props.opponentData.backgroundShader}/>
                </CornerRect>
                <Actionbar execSequence={executeRound} playerHealth={player.health / player.maxHealth * 100} {...{playerMults, opponentMults, currentStatuses}} />
            </div>
        </BattleUIStateContext.Provider>
    )
}