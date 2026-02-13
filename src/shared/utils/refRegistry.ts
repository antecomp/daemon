/**
 * @file
 * Typed registry for DOM element references keyed by a finite set
 * of string literal keys. Provides a helper to attach refs and a shared map to
 * read them — handy for coordinating UI animations within a complex component tree or scrolling to targets.
 */

/**
 * Map from allowed keys to their corresponding `HTMLElement` reference.
 * Keys are optional until a reference is registered for them.
 *  TODO: RENAME THIS TO REFREGISTRY!
 * @template {readonly string[]} K - Tuple of allowed string keys.
 */
export type RefRegistry<K extends readonly string[]> = {
    [Key in K[number]]?: HTMLElement;
};

/**
 * Function type that attaches or updates an `HTMLElement` reference for a key.
 *
 * @template {readonly string[]} K - Tuple of allowed string keys.
 */
export type RegistryAttacher<K extends readonly string[]> = (val: K[number], ref: HTMLElement) => void;

/**
 * Creates a typed element reference registry and an attacher for a finite set
 * of keys. The generic parameter `K` defines the only allowed key strings.
 *
 * Because `K` cannot be inferred (there are no value parameters), you must
 * provide a type argument that is a tuple of string literals.
 *
 * @template {readonly string[]} K - Tuple of allowed key strings.
 * @returns {{ attachToRegistry: RegistryAttacher<K>, refRegistry: RefRegistry<K> }}
 *   Object containing:
 *   - `attachToRegistry`: Registers an `HTMLElement` for a given key.
 *   - `refRegistry`: Backing map of key → `HTMLElement | undefined`.
 *
 * @example
 * // Using a type alias:
 * type Keys = ["egg", "slop", "stew"];
 * const { attachToRegistry, refRegistry } = createRefRegistry<Keys>();
 * attachToRegistry("egg", document.createElement("div"));
 * const node = refRegistry.egg; // HTMLElement | undefined
 *
 * @example
 * // Using a const tuple value type:
 * const KEYS = ["egg", "slop", "stew"] as const;
 * const { attachToRegistry, refRegistry } = createRefRegistry<typeof KEYS>();
 * attachToRegistry("slop", document.createElement("div"));
 * const maybeEl = refRegistry.slop; // HTMLElement | undefined
 */
export function createRefRegistry<const K extends readonly string[]>() {

    const refRegistry: RefRegistry<K> = {};

    const attachToRegistry: RegistryAttacher<K> = (val, ref) => {
        refRegistry[val] = ref;
    };

    return { attachToRegistry, refRegistry };
}