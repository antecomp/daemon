import { AssetURL } from "@/shared/types/misc.types";

type MoveDisplayEntry = {label: string, icon?: AssetURL, lore?: string}

// TODO: Change this record to restrict to a bank of known planned moves.
export type MoveLexicon = Record<string, MoveDisplayEntry>
//export type MoveDisplayResolver = (key: string) => MoveDisplayEntry 