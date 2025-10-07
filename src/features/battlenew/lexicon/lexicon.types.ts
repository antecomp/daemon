import { AssetURL } from "@/shared/types/misc.types";

type MoveDisplayEntry = {label: string, icon?: AssetURL, largeIcon?: AssetURL, lore?: string}
type StatusDisplayEntry = {icon?: AssetURL} // may add label/lore here also, for status tooltips/labels?


// TODO: Change this record to restrict to a bank of known planned moves.
export type MoveLexicon = Record<string, MoveDisplayEntry>

// TODO: Same idea for statuses (only map to bank of known statuses)
export type StatusLexicon = Record<string, StatusDisplayEntry>