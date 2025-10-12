import apprentice_icon from '../icons/apprentice.png'
import chain_icon from '../icons/chains.png'
import hourglass_icon from '../icons/hourglass.png'
import mage_icon from '../icons/mage.png'
import prae_icon from '../icons/PRAETORIAN.png'
import priestess_icon from '../icons/priestess.png'
import trickster_icon from '../icons/trickster.png'
import stock_icon from "@/features/battle/assets/placeholder_move_icon.png"

import { Attack, Defend, Evade, Heal, NothingMove, OverwhelmMove, Prepare } from '../moves.list'
import { MoveMeta, MovePerspective, MoveType } from "../moves.types";
import { CannotBeFirst } from "../moves.validators";
import { requestOverlayAnimation } from '../../animation/requestOverlayAnim'

const stockMoves: Record<string, MoveMeta> = {

    evade: {
        displayName: "evade",
        icon: trickster_icon,
        getMove: Evade,
    },

    heal: {
        displayName: "heal",
        icon: priestess_icon,
        getMove: Heal,
    },

    prepare: {
        displayName: "prepare",
        icon: hourglass_icon,
        getMove: Prepare,
    },

    defend: {
        displayName: "guard",
        icon: prae_icon,
        getMove: {
            ...Defend,
            // If we recycle the animation between opponents just go ahead and attach it here as a default.
            animations: { // <- But then we can override it with new animations!
                pre: [{
                    priority: 1, // why did I add this when everything I made uses priority one lol?
                    execute: async ({opponent, index, movePerspective}) => {
                        // Close enough approximation, we defend when we anticipate an aggressive move.
                        if(movePerspective == MovePerspective.Opponent) {
                            if (opponent.currentSequence[index].type === MoveType.Aggressive) {
                                await requestOverlayAnimation("shield", [0,0]);
                            }
                        } else {
                            //alert("Player used shield move via mirror. No anim.")
                        }
                    }
                }]
            }
        },
    },

    attack: {
        displayName: "attack",
        icon: stock_icon,
        getMove: Attack
    },

    overwhelm: {
        displayName: "overwhelm",
        icon: chain_icon,
        getMove: OverwhelmMove
    },

    idle: {
        displayName: "idle",
        icon: stock_icon,
        getMove: NothingMove
    },

    mirror: {
        displayName: "mirror",
        icon: mage_icon,
        getMove: (context) => {
            const oppMoveMeta = context.opponentSeq[context.index];

            // Dangerous if we have a new displayname for mirror. Might want to have general id/movetype classifier in meta....
            if(oppMoveMeta.displayName === "mirror") {
                context.self.data.mirrorFatigue = true; // For test/debug. <- might be fun to make this trigger a move that gives a status effect.
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
    },

    repeat: {
        displayName: "repeat",
        icon: apprentice_icon,
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


}

export default stockMoves;