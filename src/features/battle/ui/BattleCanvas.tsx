import { Point } from "@/shared/types/3d.types";
import { AssetURL } from "@/shared/types/misc.types";
import { onMount, useContext } from "solid-js";
import { BattleRefRegistryCTX, createBattleRefAttacher } from "../animation/uiAnimations/battleUIRefRegistry";

import { SCENE_DIMENSIONS, SIDEBAR_WIDTH } from "@/config/ui.config";
import createShaderPlane from "@/shared/hooks/createShaderPlane";

const BATTLE_CANVAS_DIMENSIONS = {
    width: SCENE_DIMENSIONS.width + SIDEBAR_WIDTH,
    height: SCENE_DIMENSIONS.height
};

export default function BattleCanvas(props: {
    sprite: AssetURL,
    spriteOffset?: Point
    backgroundShader: string
    backgroundShaderTexture?: AssetURL
}) {

    let canvasRef!: HTMLCanvasElement;

    const {attachToRegistry} = useContext(BattleRefRegistryCTX)!;
    onMount(() => createShaderPlane(canvasRef, props.backgroundShader, props.backgroundShaderTexture))

    const opponentSpriteRef = createBattleRefAttacher('opponentSprite');

    return (
        <>
            <canvas
                ref={(el) => {canvasRef = el; attachToRegistry('battleBG', el)}}
                class="battle-bg"
                {...BATTLE_CANVAS_DIMENSIONS}
            />
            <img
                ref={opponentSpriteRef}
                src={props.sprite}
                class="battle-sprite"
                style={{
                    translate: props.spriteOffset ? `${props.spriteOffset.x}px ${props.spriteOffset.y}px` : "none",
                }}
            />
        </>
    )
}