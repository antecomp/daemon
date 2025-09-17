import { onMount } from 'solid-js';
import CornerRect from '@/shared/ui/primitives/corner-rect/CornerRect';
import OppStatusBar from './ui/OppStatusbar';
import Actionbar from './ui/Actionbar';
import { BattleOutcome, DVOpponentData } from '@/core/battle/engine/battle.types';
import { BattleUIStateContext } from '@/core/battle/engine/battle.context';
import { useBattleLogic } from '@/core/battle/engine/battle.logic';
import BattleCanvas from './ui/BattleCanvas';
import ActionMessages from './ui/ActionMessages';
import { registerBattleUIRef } from './ui/refRegistry';
import { createMeltingEffect } from '@/shared/hooks/createMeltEffect';

import './ui/battle.css'
import vtl from './assets/vtl.png'
import vtr from './assets/vtr.png'

export interface BattleProps {
    opponentData: DVOpponentData,
    battleResultPromiseRef: {current?: Promise<BattleOutcome>}
    // Note: we should also be able to do a ref to forceBattleResolve if we wish.
}

export default function Battle(props: BattleProps) {

    let mainUIRef: HTMLDivElement | undefined = undefined;
    const {startMeltAnimation, filterID, filterSVG} = createMeltingEffect();

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

    onMount(() => {
        registerBattleUIRef('mainUI', mainUIRef);
        setupRound();
    });

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
                        health={opponent.healthPercent}
                        icon={props.opponentData.icon}
                        sequenceHint={insight()}
                    />
                    <BattleCanvas {...props.opponentData} />
                </CornerRect>
                <Actionbar execSequence={executeRound} playerHealth={player.healthPercent} {...{playerMults, opponentMults, currentStatuses, forceBattleResolve}} />
            </div>
        </BattleUIStateContext.Provider>
    )
}