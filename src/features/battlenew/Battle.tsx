import { onMount } from 'solid-js';
import CornerRect from '@/shared/ui/primitives/corner-rect/CornerRect';
import OppStatusBar from './ui/OppStatusbar';
import Actionbar from './ui/Actionbar';
import { BattleOutcome, DVOpponentData } from '@/core/battle/engine/battle.types';
import { BattleUIStateContext } from '@/core/battle/engine/battle.context';
import { useBattleLogic } from '@/core/battle/engine/battle.logic';
import BattleCanvas from './ui/BattleCanvas';
import { createMeltingEffect } from '@/shared/hooks/createMeltEffect';

import './ui/battle.css'
import vtl from './assets/vtl.png'
import vtr from './assets/vtr.png'
import { createUIBridedBattleEngine } from './bridge/battleEngineBridge';
import { OpponentAI, OpponentStats } from '@/core/battlenew/ai/opponentAI.types';

export interface BattleProps {
    opponentProfile: {
        slop: any, // can maybe do the sprite shiut here. idk how u wanna organize it. This is just a rough example.
        stats: OpponentStats
        ai: OpponentAI
    },
}

export default function Battle(props: BattleProps) {

    const {startMeltAnimation, filterID, filterSVG} = createMeltingEffect();

    const bridge = createUIBridedBattleEngine(props.opponentProfile.ai, props.opponentProfile.stats);

    // Method of passing the promise up to caller (battleManager).
    props.battleResultPromiseRef.current = battleResultPromise; 

    onMount(() => {
        bridge.engine.setupRound();
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