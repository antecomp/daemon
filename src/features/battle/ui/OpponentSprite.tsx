import { Point } from "@/shared/types/3d.types";
import { AssetURL } from "@/shared/types/misc.types";
import { createBattleRefAttacher } from "../animation/uiAnimations/battleUIRefRegistry";

export default function OpponentSprite(props: {
    sprite: AssetURL,
    spriteOffset?: Point
}) {
    const opponentSpriteRef = createBattleRefAttacher('opponentSprite');

    return <img
        ref={opponentSpriteRef}
        src={props.sprite}
        class="battle-sprite"
        style={{
            translate: props.spriteOffset ? `${props.spriteOffset.x}px ${props.spriteOffset.y}px` : "none",
        }}
    />
}