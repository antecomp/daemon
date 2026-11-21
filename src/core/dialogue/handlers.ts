import { setCurrentScene } from "@/app/shell/scene-container/sceneState"
import sleep from "@/shared/utils/sleep";
import { DialogueRuntime } from "./dialogue.types";
import { SparseRecord } from "@/shared/types/misc.types";

type SignalHandler = (value: string | undefined, runtime: DialogueRuntime) => void
type YieldHandler = (value: string | undefined, runtime: DialogueRuntime) => Promise<void>

export type SignalHandlerMap = Record<string, SignalHandler>
export type YieldHandlerMap = Record<string, YieldHandler>

export const DEFAULT_DIALOGUE_SIGNAL_HANDLERS = {
    change_scene(target) {
        if (!target) return;
        setCurrentScene(target);
    }
} as const satisfies SignalHandlerMap

export const DEFAULT_DIALOGUE_YIELD_HANDLERS = {
    async sleep(val) {
        const duration = Number(val);
        if (!duration || duration === Infinity) return;
        return sleep(duration);
    }
} as const satisfies YieldHandlerMap

export function createSignalHandler(
    ovr: SignalHandlerMap = {}
) {
    const handlerMap: SparseRecord<string, SignalHandler> = {
        ...DEFAULT_DIALOGUE_SIGNAL_HANDLERS,
        ...ovr
    }

    return (identifier: string, value: string | undefined, runtime: DialogueRuntime) =>
        handlerMap[identifier]?.(value, runtime);
}

export function createYieldHandler(
    ovr: YieldHandlerMap = {}
) {
    const handlerMap: SparseRecord<string, YieldHandler> = {
        ...DEFAULT_DIALOGUE_YIELD_HANDLERS,
        ...ovr
    }

    return (identifier: string, value: string | undefined, runtime: DialogueRuntime) => 
        handlerMap[identifier]?.(value, runtime);
}