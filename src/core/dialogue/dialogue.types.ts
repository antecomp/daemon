import { BnyMemory, BnyMemoryUpdateHandler } from "@bunnarray/vm";
import { AssetURL } from "@/shared/types/misc.types";
import { Setter } from "solid-js";

type DialogueRuntime = {
    memory: BnyMemory;
    setOverlay: Setter<AssetURL | undefined>;
}

type YieldResult = void | { advance: true }

// TODO: Consider adding a speaker map as part of the context!
export type DialogueContext = {
    initialOverlay?: AssetURL;
    onSignal?: (id: string, value: string | undefined, runtime: DialogueRuntime) => void;
    onYield?: (id: string, value: string | undefined, runtime: DialogueRuntime) => Promise<YieldResult>;
    onMemoryUpdate?: BnyMemoryUpdateHandler;
    initialMemory?: Record<string, string>;
}

export type DialogueOption = {
    summary: string,
    full: string,
    select: () => void;
}
