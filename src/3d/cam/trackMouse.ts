import { Vector2 } from "three";

/** Writes enabled pointer movement over `el` into `out` as NDC (-1..1, y up).
 * @returns a disposer. 
 */
export default function trackMouse(el: HTMLElement, out: Vector2, enabled: () => boolean = () => true) {
    const onMove = (e: MouseEvent) => {
        if (!enabled()) return;
        const r = el.getBoundingClientRect();
        out.set(
            ((e.clientX - r.left) / r.width) * 2 - 1,
            -(((e.clientY - r.top) / r.height) * 2 - 1),
        );
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
}
