import sleep from "./sleep";

/** Simple wrapper for .animate to make it Promise-based (such that we can await it) instead of callback based.
 * @argument element - the element to animate
 * @argument keyframes - Keyframes: https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats
 * @argument options - Keyframe options: https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/KeyframeEffect#parameters
 */
const animateAsync = async (
    element: HTMLElement | SVGElement,
    keyframes: Keyframe[] | PropertyIndexedKeyframes,
    options?: number | KeyframeAnimationOptions
  ): Promise<Animation> => {
    return new Promise((resolve) => {
      const animation = element.animate(keyframes, options);

      // Safari (WebKit) has an issue where it may defer the resolution of the `onfinish` callback
      // for animations until a user interaction occurs. Adding a `sleep(0)` here acts as a "thread kicker,"
      // yielding control back to the browser and forcing Safari to process pending tasks, including
      // the `onfinish` callback.
      sleep(0);

      animation.onfinish = () => {
        resolve(animation)
      };
    });
}

export default animateAsync;
