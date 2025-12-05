// helper: robust scale even across zoom / transforms
function getElementScale(el: HTMLElement) {
  // offsetWidth is layout size in CSS px (unscaled)
  // getBoundingClientRect().width is the *rendered* size (after zoom/transform)
  const rect = el.getBoundingClientRect();
  const ow = el.offsetWidth || 1; // avoid div-by-zero
  return rect.width / ow;
}

/** Gets the mouse position relative to some element. */
export function getRelativeMousePosition(evt: MouseEvent, el: HTMLElement) {
    const scale = getElementScale(el);          // works for both `zoom` and `transform: scale`
    const rect = el.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / scale,
        y: (evt.clientY - rect.top) / scale,
    };
}

/** Gets the relative offset of one HTML element relative to another. */
export function getRelativeOffset(target: HTMLElement, relativeTo: HTMLElement) {
  const scale = getElementScale(relativeTo);
  const a = target.getBoundingClientRect();
  const b = relativeTo.getBoundingClientRect();
  return { x: (a.left - b.left) / scale, y: (a.top - b.top) / scale };
}