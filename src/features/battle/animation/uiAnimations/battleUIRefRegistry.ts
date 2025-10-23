/** @fileoverview
 * @ref `refRegistry.ts` -- this is an implementation of that system. Ref registry of various battle components, used to coordinate animations from a single source.  */

import { RegistryAttacher } from "@/shared/utils/refRegistry";
import { createContext, useContext } from "solid-js";

export type BattleRefNames = ["sequenceViewPlayer", "sequenceViewOpponent", "opponentSprite"];

interface BattleRefRegistry {
    attachToRegistry: RegistryAttacher<BattleRefNames>
}

export const BattleRefRegistryCTX = createContext<BattleRefRegistry>();

export function createBattleRefAttacher(as: BattleRefNames[number]) {
    const {attachToRegistry} = useContext(BattleRefRegistryCTX)!;
    return (ref: HTMLElement) => attachToRegistry(as, ref);
}