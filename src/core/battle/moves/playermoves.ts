import { MultiplierSet, PlayerMoveData } from "../engine/battle.types";
import apprentice_icon from './icons/apprentice.png'
import candle_icon from './icons/candle.png'
import chain_icon from './icons/chains.png'
import hourglass_icon from './icons/hourglass.png'
import mage_icon from './icons/mage.png'
import prae_icon from './icons/PRAETORIAN.png'
import priestess_icon from './icons/priestess.png'
import trickster_icon from './icons/trickster.png'
import lantern_icon from './icons/lantern.png'

import apprentice_icon_ex from './icons/apprentice_ex.png'
import candle_icon_ex from './icons/candle_ex.png'
import chain_icon_ex from './icons/chain_ex.png'
import hourglass_icon_ex from './icons/hourglass_ex.png'
import mage_icon_ex from './icons/mage_ex.png'
import prae_icon_ex from './icons/prae_ex.png'
import priestess_icon_ex from './icons/priestess_ex.png'
import trickster_icon_ex from './icons/trickster_ex.png'
import lantern_icon_ex from './icons/lantern.png'
import { AggressiveMove, NothingMove } from "../engine/moves";
import { DefendMove, EvadeMove, HealMove, ObserveMove, PrepareMove, RepeatMove } from "./genericMoves";

export const Attack: PlayerMoveData = {
    displayName: "Candlelight",
    icon: candle_icon,
    rbIcon: candle_icon_ex,
    instance: new AggressiveMove()
}

export const Defend: PlayerMoveData = {
    displayName: "Praetorian",
    icon: prae_icon,
    rbIcon: prae_icon_ex,
    instance: new DefendMove()
}

export const Repeat: PlayerMoveData = {
    displayName: "Apprentice",
    icon: apprentice_icon,
    rbIcon: apprentice_icon_ex,
    instance: new RepeatMove()
}

// Abstract - Double enemy multipliers (maybe for some amount of turns?), both incoming and outgoing - can be helpful or harmful so you have to predict how the enemy will act
export const Abstract: PlayerMoveData = {
    displayName: "Abstract",
    icon: chain_icon,
    rbIcon: chain_icon_ex,
    instance: NothingMove
}

export const Prepare: PlayerMoveData = {
    displayName: "Hourglass",
    icon: hourglass_icon,
    rbIcon: hourglass_icon_ex,
    instance: new PrepareMove()
}

export const Observe: PlayerMoveData = {
    displayName: "Lantern",
    icon: mage_icon,
    rbIcon: mage_icon_ex,
    instance: new ObserveMove()
}

export const Heal: PlayerMoveData = {
    displayName: "Priestess",
    icon: priestess_icon,
    rbIcon: priestess_icon_ex,
    instance: new HealMove()
}

export const Evade: PlayerMoveData = {
    displayName: "Trickster",
    icon: trickster_icon,
    rbIcon: trickster_icon_ex,
    instance: new EvadeMove()
}