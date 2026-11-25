import { Vector2 } from "three";

/** Writes the pointer position over `el` into `out` as NDC (-1..1, y up). 
 * @returns a disposer. 
 */
export default function trackMouse(el: HTMLElement, out: Vector2) {
    const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        out.set(
            ((e.clientX - r.left) / r.width) * 2 - 1,
            -(((e.clientY - r.top) / r.height) * 2 - 1),
        );
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
}