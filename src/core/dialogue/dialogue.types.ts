import { BnyMemory, BnyMemoryUpdateHandler } from "@bunnarray/vm";
import { AssetURL } from "@/shared/types/misc.types";
import { Setter } from "solid-js";
import { SignalHandlerMap, YieldHandlerMap } from "./handlers";

/** Live dialogue state available to signal and yield handlers. */
export type DialogueRuntime = {
    /** Current dialogue memory. */
    memory: BnyMemory;
    /** Show or clear the image behind the dialogue. */
    setOverlay: Setter<AssetURL | undefined>;
}

/** Optional content and behavior supplied when a dialogue starts. */
export type DialogueContext = {
    /** Image shown behind the dialogue when it opens. */
    initialOverlay?: AssetURL;
    /** Called whenever the dialogue changes its memory. */
    onMemoryUpdate?: BnyMemoryUpdateHandler;
    /** Memory initializers `{[identifer]: value}` */
    initialMemory?: Record<string, string>;
    /** Handle named yields that pause the dialogue; overrides the matching default. */
    yieldHandlers?: YieldHandlerMap,
    /** Handle named signals without pausing the dialogue; overrides the matching default. */
    signalHandlers?: SignalHandlerMap,
    /** Replace speaker names. */
    speakerNames?: Record<string, string>
}