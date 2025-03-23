import { DVOpponentData } from "@/core/battle/engine/battle.types";
import newports_icon from "@/assets/artwork/dæmons/newport_icon.png"
import newports_sprite from "@/assets/artwork/dæmons/newports1.gif"
import fractalNoiseShader from "@/shaders/backgrounds/fractal.shader";
import { MoveMeta } from "@/core/battle/moves/moves.types";
import stockMoves from "@/core/battle/moves/metas/stockMoves";

const cancer: MoveMeta = {
    ...stockMoves.attack,
    displayName: "Cancer"
}


export const OPPONENT_NEWPORTS: DVOpponentData = {
    name: "Mothafuckin' Newports",
    icon: newports_icon,
    sprite: newports_sprite,
    backgroundShader: fractalNoiseShader,
    maxHealth: 100,
    getSequence: () => {
        return [cancer, cancer, cancer, cancer, cancer]
    }
}