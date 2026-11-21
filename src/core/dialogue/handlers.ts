import { setCurrentScene } from "@/app/shell/scene-container/sceneState"
import sleep from "@/shared/utils/sleep";
import { DialogueRuntime } from "./dialogue.types";
import { SparseRecord } from "@/shared/types/misc.types";

type SignalHandler = (value: string | undefined, runtime: DialogueRuntime) => void
type YieldHandler = (value: string | undefined, runtime: DialogueRuntime) => Promise<void | { advance: true }>

export type SignalHandlerMap = { [identifier: string]: SignalHandler }
export type YieldHandlerMap = { [identifier: string]: YieldHandler }

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
        await sleep(duration);
        return { advance: true }
    }

    // todo battle by name? Or I need some nice way to pass an imported battle in...
} as const satisfies YieldHandlerMap

export function createDialogueSignalHandler(
    ovr: SignalHandlerMap = {}
) {
    const handlerMap: SparseRecord<string, SignalHandler> = {
        ...DEFAULT_DIALOGUE_SIGNAL_HANDLERS,
        ...ovr
    }

    return (identifier: string, value: string | undefined, runtime: DialogueRuntime) =>
        handlerMap[identifier]?.(value, runtime);
}

export function createDialogueYieldHandler(
    ovr: YieldHandlerMap = {}
) {
    const handlerMap: SparseRecord<string, YieldHandler> = {
        ...DEFAULT_DIALOGUE_YIELD_HANDLERS,
        ...ovr
    }

    return (identifier: string, value: string | undefined, runtime: DialogueRuntime) =>
        handlerMap[identifier]?.(value, runtime);
}