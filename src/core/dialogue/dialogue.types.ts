export type DialogueContext = {
    onSignal?: (id: string, value?: string) => void;
    onYield?: (id: string, value?: string) => Promise<void>;
    initialMemory?: Record<string, string>
}

export type DialogueOption = {
    summary: string,
    full: string,
    select: () => void;
}