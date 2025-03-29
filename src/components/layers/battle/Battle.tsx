import { onMount } from 'solid-js';
import './ui/battle.css'
import CornerRect from '@/components/util/corner-rect/CornerRect';
import vtl from './assets/vtl.png'
import vtr from './assets/vtr.png'
import OppStatusBar from './ui/OppStatusbar';
import Actionbar from './ui/Actionbar';
import { BattleOutcome, DVOpponentData } from '@/core/battle/engine/battle.types';
import { BattleUIStateContext } from '@/core/battle/engine/battle.context';
import { useBattleLogic } from '@/core/battle/engine/battle.logic';
import BattleCanvas from './ui/BattleCanvas';
import ActionMessages from './ui/ActionMessages';
import { registerBattleUIRef } from './ui/refRegistry';
import { createMeltingEffect } from '@/hooks/createMeltEffect';

export interface BattleProps {
    opponentData: DVOpponentData,
    battleResultPromiseRef: {current?: Promise<BattleOutcome>}
    // Note: we should also be able to do a ref to forceBattleResolve if we wish.
}

export default function Battle(props: BattleProps) {

    let mainUIRef: HTMLDivElement | undefined = undefined;
    onMount(() => {
        registerBattleUIRef('mainUI', mainUIRef);
    })

    const {startMeltAnimation, filterID, filterSVG} = createMeltingEffect();

    // Hook with a bigass return to handle battle logic and pass back needed UI changes.
    const { 
        playerMults, opponentMults, 
        battleUIState, setBattleUIState, 
        player, opponent, 
        setupRound, executeRound, 
        insight, 
        currentStatuses, 
        actionMessages,
        battleResultPromise,
        forceBattleResolve
    } = useBattleLogic(props.opponentData, false, startMeltAnimation, true);

    // Method of passing the promise up to caller (battleManager).
    props.battleResultPromiseRef.current = battleResultPromise; 

    onMount(() => setupRound());

    return (
        <BattleUIStateContext.Provider value={{battleUIState, setBattleUIState}}>
            {filterSVG}
            <div 
                id="battle-container" 
                ref={mainUIRef}
                style={{
                    filter: `url(#${filterID})`
                }}
            >
                <ActionMessages messages={actionMessages}/>
                <CornerRect id="battle-view" borderSize={2} borderType='solid white' corners={[vtl, vtr]}>
                    <OppStatusBar
                        name={opponent.name.toUpperCase()}
                        health={opponent.health / props.opponentData.maxHealth * 100}
                        icon={props.opponentData.icon}
                        sequenceHint={insight()}
                    />
                    <BattleCanvas sprite={props.opponentData.sprite} spriteOffset={props.opponentData.spriteOffset} fragmentShader={props.opponentData.backgroundShader} />
                </CornerRect>
                <Actionbar execSequence={executeRound} playerHealth={player.health / player.maxHealth * 100} {...{playerMults, opponentMults, currentStatuses, forceBattleResolve}} />
            </div>
        </BattleUIStateContext.Provider>
    )
}