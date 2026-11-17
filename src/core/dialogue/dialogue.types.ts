import { BnyMemory, BnyMemoryUpdateHandler } from "@bunnarray/vm";

type DialogueRuntime = {
    memory: BnyMemory
}

// TODO: Consider adding a speaker map as part of the context!
export type DialogueContext = {
    onSignal?: (id: string, value: string | undefined, runtime: DialogueRuntime) => void;
    onYield?: (id: string, value: string | undefined, runtime: DialogueRuntime) => Promise<void>;
    onMemoryUpdate?: BnyMemoryUpdateHandler;
    initialMemory?: Record<string, string>;
}

export type DialogueOption = {
    summary: string,
    full: string,
    select: () => void;
}