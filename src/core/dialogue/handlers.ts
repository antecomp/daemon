import { setCurrentScene } from "@/app/shell/scene-container/sceneState"
import sleep from "@/shared/utils/sleep";
import { DialogueRuntime } from "./dialogue.types";
import { SparseRecord } from "@/shared/types/misc.types";

/** Reacts to a signal without pausing the dialogue. */
type SignalHandler = (value: string | undefined, runtime: DialogueRuntime) => void
/** Runs while dialogue is paused; return `{ advance: true }` to skip the next continue prompt. */
type YieldHandler = (value: string | undefined, runtime: DialogueRuntime) => Promise<void | { advance: true }>

/** Signal handlers keyed by identifier, used in the dialogue program. */
export type SignalHandlerMap = { [identifier: string]: SignalHandler }
/** Yield handlers keyed by identifier, used in the dialogue program. */
export type YieldHandlerMap = { [identifier: string]: YieldHandler }

/** Built-in signal handlers. */
export const DEFAULT_DIALOGUE_SIGNAL_HANDLERS = {
    change_scene(target) {
        if (!target) return;
        setCurrentScene(target);
    }
} as const satisfies SignalHandlerMap

/** Built-in yield handlers */
export const DEFAULT_DIALOGUE_YIELD_HANDLERS = {
    async sleep(val) {
        const duration = Number(val);
        if (!duration || duration === Infinity) return;
        await sleep(duration);
        return { advance: true }
    }
} as const satisfies YieldHandlerMap

/** Use built-in signals, adding or replacing handlers from `ovr`. */
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

/** Use built-in yields, adding or replacing handlers from `ovr`. */
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
