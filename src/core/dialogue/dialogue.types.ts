import { BnyMemory, BnyMemoryUpdateHandler } from "@bunnarray/vm";
import { AssetURL } from "@/shared/types/misc.types";
import { Setter } from "solid-js";
import { SignalHandlerMap, YieldHandlerMap } from "./handlers";

export type DialogueRuntime = {
    memory: BnyMemory;
    setOverlay: Setter<AssetURL | undefined>;
}

// TODO: Consider adding a speaker map as part of the context!
export type DialogueContext = {
    initialOverlay?: AssetURL;
    onMemoryUpdate?: BnyMemoryUpdateHandler;
    initialMemory?: Record<string, string>;
    yieldHandlers?: YieldHandlerMap,
    signalHandlers?: SignalHandlerMap,
    speakerNames?: Record<string, string>
}

export type DialogueOption = {
    summary: string,
    full: string,
    select: () => void;
}
