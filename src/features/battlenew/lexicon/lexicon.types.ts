import { AssetURL } from "@/shared/types/misc.types";

type MoveDisplayEntry = {label: string, icon?: AssetURL, largeIcon?: AssetURL, lore?: string}
type StatusDisplayEntry = {icon?: AssetURL} // may add label/lore here also, for status tooltips/labels?


export type KnownPlanName = "repeat" | "evade" | "heal" | "prepare" | "defend" | "attack" | "overwhelm" | "mirror" | "idle";
export type KnownStatusName = "prepared" | "vulnerable" | "mania"

export type MoveLexicon = Record<KnownPlanName, MoveDisplayEntry>
export type StatusLexicon = Record<KnownStatusName, StatusDisplayEntry>