import { BnyMemoryUpdateHandler } from "@bunnarray/vm";

export type DialogueContext = {
    onSignal?: (id: string, value?: string) => void;
    onYield?: (id: string, value?: string) => Promise<void>;
    onMemoryUpdate?: BnyMemoryUpdateHandler;
    initialMemory?: Record<string, string>;
}

export type DialogueOption = {
    summary: string,
    full: string,
    select: () => void;
}