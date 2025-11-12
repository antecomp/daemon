/** @fileoverview
 * @ref `refRegistry.ts` -- this is an implementation of that system. Ref registry of various battle components, used to coordinate animations from a single source.  */

import { RegistryAttacher } from "@/shared/utils/refRegistry";
import { createContext, useContext } from "solid-js";

export type BattleRefNames = ["sequenceViewPlayer", "sequenceViewOpponent", "opponentSprite"];

interface BattleRefRegistry {
    attachToRegistry: RegistryAttacher<BattleRefNames>
}

export const BattleRefRegistryCTX = createContext<BattleRefRegistry>();

/**
 * Creates a ref attacher function for battle UI elements.
 * 
 * @param as - The name identifier for the battle ref to be registered
 * @returns A ref callback function that attaches the HTML element to the battle ref registry
 * 
 * @example
 * const refAttacher = createBattleRefAttacher('opponentSprite');
 * <div ref={opponentSprite} />
 */
export function createBattleRefAttacher(as: BattleRefNames[number]) {
    const {attachToRegistry} = useContext(BattleRefRegistryCTX)!;
    return (ref: HTMLElement) => attachToRegistry(as, ref);
}