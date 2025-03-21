import sleep from "./sleep";

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

      //const duration = typeof options === "number" ? options : options?.duration || 0;
      //const endDelay = (options as KeyframeAnimationOptions)?.endDelay || 0;

      // Fallback resolution after the animation's duration + endDelay
      // Safari (webkit) has an issue where it may defer the resolution of the `onfinish` callback
      // for animations until a user interaction occurs. This `setTimeout` acts as a safety net
      // to ensure the animation promise resolves even if Safari delays the `onfinish` event.
      // Strangely enough, this never seems to actually trigger in safari, 
      // but it makes it respect the .onfinish? 
      // I could write a book explaining the edge cases that led to this, 
      //    like how this is only needed in setupRound when called from executeRound but not in executeRound itself or setupRounds onMount call.
      // const timeout = setTimeout(() => {
      //     console.log("Forcing animation resolution");
      //     resolve(animation);
      // }, Number(duration) + endDelay);

      // A simple thread-kicker like this seems to also work in safari lol.
      sleep(0);

      animation.onfinish = () => {
        // clearTimeout(timeout);
        resolve(animation)
      };
    });
}

export default animateAsync;