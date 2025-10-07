import { RegistryAttacher } from "@/shared/utils/refRegistry";
import { createContext, useContext } from "solid-js";



export type BattleRefNames = ["test", "alias2", "kdjs"];

interface BattleRefRegistry {
    attachToRegistry: RegistryAttacher<BattleRefNames>
}

export const BattleRefRegistryCTX = createContext<BattleRefRegistry>();

// export function useBattleRegistry() {
//     const ctx = useContext(BattleRefRegistryCTX);
//     if (!ctx) throw new Error("Not in correct scope to use battlr registry attacher");
//     return ctx;
// }

export function createBattleRefAttacher(as: BattleRefNames[number]) {
    console.log('kdsfjl')
    const {attachToRegistry} = useContext(BattleRefRegistryCTX)!;
    console.log('egg');
    return (ref: HTMLElement) => attachToRegistry(as, ref);

}

// then run createRefRegistry with the BattleRefNames type in Battls