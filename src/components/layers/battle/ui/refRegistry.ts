
type validRefNames = 'sequenceViewPlayer' | 'sequenceViewOpponent' | 'mainUI' | 'opponentSprite';

/** Registry used to globalize refs. Used to target elements to perform animations.
 * Do not use this registry directly, instead use the helper methods register and get.
 */
const battleUIRefsRegistry: Record<validRefNames, HTMLElement | undefined> = {
    sequenceViewPlayer: undefined,
    sequenceViewOpponent: undefined,
    mainUI: undefined,
    opponentSprite: undefined,
}

/** Use this inside onMount for battle UI elements to register them for global access. */
export function registerBattleUIRef(name: validRefNames, ref: HTMLElement | undefined) {
    battleUIRefsRegistry[name] = ref;
}

/** get a battle UI ref by name. Used to grab elements for performing animations. */
export function getBattleUIRef(name: validRefNames): HTMLElement | undefined {
    return battleUIRefsRegistry[name];
}