import { Point } from "@/shared/types/3d.types";
import { AssetURL } from "@/shared/types/misc.types";
import { createBattleRefAttacher } from "../animation/uiAnimations/battleUIRefRegistry";
import { BattleUIState, useBattleUIState } from "../bridge/battleUIState";

export default function OpponentSprite(props: {
    sprite: AssetURL,
    spriteOffset?: Point
}) {
    const opponentSpriteRef = createBattleRefAttacher('opponentSprite');
    const {battleUIState} = useBattleUIState();

    return <img
        ref={opponentSpriteRef}
        src={props.sprite}
        class="battle-sprite"
        style={{
            translate: props.spriteOffset ? `${props.spriteOffset.x}px ${props.spriteOffset.y}px` : "none",
        }}
        classList={{
            forsaken: battleUIState() == BattleUIState.FORSAKE
        }}
    />
}