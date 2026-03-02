import attachToConsole from "@/devtools/attachToConsole";
import { createSignal } from "solid-js";

export type ReleaseFn = () => void;
export type UILock = {
    acquire: () => ReleaseFn
    isLocked: () => boolean
}

function makeLockCounter(): UILock {
  const [count, setCount] = createSignal(0);

  function acquire(): ReleaseFn {
    setCount(prev => prev + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setCount(prev => Math.max(0, prev - 1));
    };
  }

  return { acquire, isLocked: () => count() > 0 };
}

function makeCompositeLock(...locks: Array<UILock>) {
    return {
        acquire() {
            const releases = locks.map(lock => lock.acquire());
            let released = false;
            return () => {
                if (released) return;
                released = true;
                releases.forEach(rel => rel());
            }
        },
        isLocked() {
            return locks.every(lock => lock.isLocked())
        }
    }
}

const sceneLock = makeLockCounter();
const sidebarLock = makeLockCounter();
const shellLock = makeCompositeLock(sceneLock, sidebarLock);
// How can I make a nice helper for ShellLock here?


export { sceneLock, sidebarLock, shellLock };

attachToConsole({sceneLock, sidebarLock, shellLock}, "UI_LOCKS");