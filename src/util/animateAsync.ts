/** Simple wrapper for .animate to make it Promise-based (such that we can await it) instead of callback based.
 * @argument element - the element to animate
 * @argument keyframes - Keyframes: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats
 * @argument options - Keyframe options: https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/KeyframeEffect#parameters
 */
const animateAsync = async (
    element: HTMLElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: number | KeyframeAnimationOptions
  ): Promise<Animation> => {
    return new Promise((resolve) => {
      const animation = element.animate(keyframes, options);
      animation.onfinish = () => resolve(animation);
    });
}

export default animateAsync;