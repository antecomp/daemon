import { SCENE_DIMENSIONS } from "@/config/ui.config";

export default function BattleCanvas() {

    // TODO - Remove these magic numbers!
    return (
        <canvas
            id="battle-bg"
            width="985" height={SCENE_DIMENSIONS.height + 26} 
        />
    )
}