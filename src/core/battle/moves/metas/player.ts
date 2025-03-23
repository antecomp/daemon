import candle_icon from '../icons/candle.png'

import apprentice_icon_ex from '../icons/apprentice_ex.png'
import candle_icon_ex from '../icons/candle_ex.png'
import chain_icon_ex from '../icons/chain_ex.png'
import hourglass_icon_ex from '../icons/hourglass_ex.png'
import mage_icon_ex from '../icons/mage_ex.png'
import prae_icon_ex from '../icons/prae_ex.png'
import priestess_icon_ex from '../icons/priestess_ex.png'
import trickster_icon_ex from '../icons/trickster_ex.png'
import { MovePerspective, PlayerMoveMeta } from '../moves.types'
import { Attack } from '../moves.list'
import { requestOverlayAnimation } from '../../animation/requestOverlayAnim'

import { playSound } from '@/util/playSound'

import candle_sfx from '@/assets/sfx/battle/candle.wav'
import stockMoves from './stockMoves'



export const playerMoves: Record<string, PlayerMoveMeta> = {
    repeat: {
        ...stockMoves.repeat,
        displayName: "apprentice",
        rbIcon: apprentice_icon_ex,
        description: `Like the flowers, knowledge comes from the rotting ones. \n \n Maintain momentum. Repeats previous rune. \n Cannot be used first.`,        
    },

    evade: {
        ...stockMoves.evade,
        displayName: "trickster",
        rbIcon: trickster_icon_ex,
        description: `Our first understanding of self comes from a two-faced fox. \n\n Localized distortion of existence, chance to completely negate damage of incoming attacks.`
    },

    heal: {
        ...stockMoves.heal,
        displayName: "priestess",
        rbIcon: priestess_icon_ex,
        description: `We only stay for the pretty music. \n\n Focus on restoring a sense of reality. If not attacked, heal.`
    },

    prepare: {
        ...stockMoves.prepare,
        displayName: "hourglass",
        rbIcon: hourglass_icon_ex,
        description: `The sand is nauseous from your constant turmoil. \n\n Carefully calculate strategy. Increases effectiveness of subsequent rune.`        
    },

    defend: {
        ...stockMoves.defend,
        displayName: "praetorian",
        rbIcon: prae_icon_ex,
        description: `The bravest coward you'll ever meet. \n\n Cling to personal illusion. Reduce damage of incoming attacks.`        
    },

    overwhelm: {
        ...stockMoves.overwhelm,
        rbIcon: chain_icon_ex,
        description: `We are still ultimately animals. \n\n Anticipate opponent will cling to reality. Deals damage only on defensive moves.`
    },

    mirror: {
        ...stockMoves.mirror,
        rbIcon: mage_icon_ex,
        description: `Distorted truths cut like knives. \n \n Perform the same action as opponent.`
    },

    // Just completely write our own here because the inheritence is meaningless.
    // I was fighting TS trying to just get the attack move and add animations but it was having none of it so who cares.
    attack: {
        displayName: "candlelight",
        icon: candle_icon,
        rbIcon: candle_icon_ex,
        getMove: {
            ...Attack,
            animations: {
                pre: [
                    {
                        priority: 1,
                        execute: async ({self, movePerspective}) => {
                            if(movePerspective != MovePerspective.Player) return;
                            const preparedLevel = self.getStatusLevel("prepared");
                            if(preparedLevel == 1) {
                                await requestOverlayAnimation("slash_purpose", [-80, -20]);
                            } else if (preparedLevel >= 2) {
                                await requestOverlayAnimation("slash_majes", [-20, -20]);
                            } else if (self.getStatusLevel("mania") > 0) {
                                await requestOverlayAnimation("slash_elag", [20, -20])
                            } else {
                                await requestOverlayAnimation("slash_norm", [0, 45]);
                            }
                        },
                        soundEffect: async ({movePerspective}) => {if (movePerspective == MovePerspective.Player) await playSound(candle_sfx)}
                    }
                ]
        }
        },
        description: `If moonlight heals, what does candlelight do? \n \n Directly challenge opponents' sense of reality. Deals damage.`
    },


}