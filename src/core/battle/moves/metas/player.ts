import apprentice_icon from '../icons/apprentice.png'
import candle_icon from '../icons/candle.png'
import chain_icon from '../icons/chains.png'
import hourglass_icon from '../icons/hourglass.png'
import mage_icon from '../icons/mage.png'
import prae_icon from '../icons/PRAETORIAN.png'
import priestess_icon from '../icons/priestess.png'
import trickster_icon from '../icons/trickster.png'
import lantern_icon from '../icons/lantern.png'

import apprentice_icon_ex from '../icons/apprentice_ex.png'
import candle_icon_ex from '../icons/candle_ex.png'
import chain_icon_ex from '../icons/chain_ex.png'
import hourglass_icon_ex from '../icons/hourglass_ex.png'
import mage_icon_ex from '../icons/mage_ex.png'
import prae_icon_ex from '../icons/prae_ex.png'
import priestess_icon_ex from '../icons/priestess_ex.png'
import trickster_icon_ex from '../icons/trickster_ex.png'
import lantern_icon_ex from '../icons/lantern.png'
import { PlayerMoveMeta } from '../moves.types'
import { Attack, Defend, Evade, Heal, NothingMove, Observe, Prepare } from '../moves.list'



// For now we can put all the player moves in a single table like this.
// Once stuff gets more dynamic, we can break it up as we need.
export const playerMoves: Record<string, PlayerMoveMeta> = {

    // We may want to move this some general definition.
    repeat: {
        displayName: "apprentice",
        icon: apprentice_icon,
        rbIcon: apprentice_icon_ex,
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
        }
    },

    observe: {
        displayName: "lantern",
        icon: mage_icon,
        rbIcon: mage_icon_ex,
        getMove: Observe
    },

    attack: {
        displayName: "candlelight",
        icon: candle_icon,
        rbIcon: candle_icon_ex,
        getMove: Attack
    },

    evade: {
        displayName: "trickster",
        icon: trickster_icon,
        rbIcon: trickster_icon_ex,
        getMove: Evade
    },

    heal: {
        displayName: "priestess",
        icon: priestess_icon,
        rbIcon: priestess_icon_ex,
        getMove: Heal
    },

    prepare: {
        displayName: "hourglass",
        icon: hourglass_icon,
        rbIcon: hourglass_icon_ex,
        getMove: Prepare
    },

    defend: {
        displayName: "praetorian",
        icon: prae_icon,
        rbIcon: prae_icon_ex,
        getMove: Defend
    },

    abstract: {
        displayName: "abstract",
        icon: chain_icon,
        rbIcon: chain_icon_ex,
        getMove: NothingMove
    }
}