import apprentice_icon from '../icons/apprentice.png'
import candle_icon from '../icons/candle.png'
import chain_icon from '../icons/chains.png'
import hourglass_icon from '../icons/hourglass.png'
import mage_icon from '../icons/mage.png'
import prae_icon from '../icons/PRAETORIAN.png'
import priestess_icon from '../icons/priestess.png'
import trickster_icon from '../icons/trickster.png'

import apprentice_icon_ex from '../icons/apprentice_ex.png'
import candle_icon_ex from '../icons/candle_ex.png'
import chain_icon_ex from '../icons/chain_ex.png'
import hourglass_icon_ex from '../icons/hourglass_ex.png'
import mage_icon_ex from '../icons/mage_ex.png'
import prae_icon_ex from '../icons/prae_ex.png'
import priestess_icon_ex from '../icons/priestess_ex.png'
import trickster_icon_ex from '../icons/trickster_ex.png'
import { PlayerMoveMeta } from '../moves.types'
import { Attack, Defend, Evade, Heal, NothingMove, OverwhelmMove, Prepare } from '../moves.list'
import { CannotBeFirst } from '../moves.validators'
import { requestOverlayAnimation } from '../../animation/useOverlayAnim'



// For now we can put all the player moves in a single table like this.
// Once stuff gets more dynamic, we can break it up as we need.
export const playerMoves: Record<string, PlayerMoveMeta> = {

    repeat: {
        displayName: "apprentice",
        icon: apprentice_icon,
        rbIcon: apprentice_icon_ex,
        description: `Like the flowers, knowledge comes from the rotting ones. \n \n Maintain momentum. Repeats previous rune. \n Cannot be used first.`,
        getMove: (context) => {

            const prevMeta = context.seq[context.index - 1];

            if(!prevMeta) {
                console.error("Repeat unable to acquire previous move!")
                return NothingMove;
            }

            if(typeof prevMeta.getMove == "function") { // getMove has some special logic that will return a move.
                return prevMeta.getMove(context);
            } else { // We just have a move straight-up
                return prevMeta.getMove;
            }
        },
        canPerform: CannotBeFirst
    },

    evade: {
        displayName: "trickster",
        icon: trickster_icon,
        rbIcon: trickster_icon_ex,
        getMove: Evade,
        description: `Our first understanding of self comes from a two-faced fox. \n\n Localized distortion of existence, chance to completely negate damage of incoming attacks.`
    },

    heal: {
        displayName: "priestess",
        icon: priestess_icon,
        rbIcon: priestess_icon_ex,
        getMove: Heal,
        description: `We only stay for the pretty music. \n\n Focus on restoring a sense of reality. If not attacked, heal.`
    },

    prepare: {
        displayName: "hourglass",
        icon: hourglass_icon,
        rbIcon: hourglass_icon_ex,
        getMove: Prepare,
        description: `The sand is nauseous from your constant turmoil. \n\n Carefully calculate strategy. Increases effectiveness of subsequent rune.`
    },

    defend: {
        displayName: "praetorian",
        icon: prae_icon,
        rbIcon: prae_icon_ex,
        getMove: Defend,
        description: `The bravest coward you'll ever meet. \n\n Cling to personal illusion. Reduce damage of incoming attacks.`
    },

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
                        execute: async ({self}) => {
                            const preparedLevel = self.getStatusLevel("prepared")

                            if(preparedLevel == 1) {
                                await requestOverlayAnimation("slash_purpose", [-29, 0]);
                            } else if (preparedLevel >= 2) {
                                await requestOverlayAnimation("slash_majes", [-29, 0]);
                            } else if (self.getStatusLevel("mania") > 0) {
                                await requestOverlayAnimation("slash_elag", [0, 0])
                            } else {
                                await requestOverlayAnimation("slash_norm", [-29, 50]);
                            }
                        }
                    }
                ]
        }
        },
        description: `If moonlight heals, what does candlelight do? \n \n Directly challenge opponents' sense of reality. Deals damage.`
    },

    overwhelm: {
        displayName: "overwhelm",
        icon: chain_icon,
        rbIcon: chain_icon_ex,
        getMove: OverwhelmMove,
        description: `We are still ultimately animals. \n\n Anticipate opponent will to cling to reality. Deals damage only on defensive moves.`
    },

    mirror: {
        displayName: "mirror",
        icon: mage_icon,
        rbIcon: mage_icon_ex,
        getMove: (context) => {
            const oppMoveMeta = context.opponentSeq[context.index];

            // Dangerous if we have a new displayname for mirror. Might want to have general id/movetype classifier in meta....
            if(oppMoveMeta.displayName === "mirror") {
                context.self.data.mirrorFatigue = true; // For test/debug.
                console.log("trigger");
                return NothingMove; // Change to a generalized "fail" move later.
            }

            if(typeof oppMoveMeta.getMove == "function") {
                //return oppMoveMeta.getMove(context) // I think we just pass context with no swap...

                //Try swap
                return oppMoveMeta.getMove({
                    self: context.opponent,
                    opponent: context.self,
                    seq: context.opponentSeq,
                    opponentSeq: context.seq,
                    index: context.index
                })
            } else {
                return oppMoveMeta.getMove;
            }
        },
        description: `Distorted truths cut like knives. \n \n Perform the same action as opponent.`
    },

}