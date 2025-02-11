/** Simple helper to force a sleep period in an async/await
 * @param ms - amount of time to sleep (ms)
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export default sleep;