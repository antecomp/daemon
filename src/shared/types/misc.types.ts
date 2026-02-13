
export interface AssArray<T> {
    [key: string]: T;
}/** alias to string for intention readability - represents a imported asset that resolves to a URL when built */
export type AssetURL = string
/** Common CSS units attached to numbers. */
export type CSSUnit = `${number}px` | `${number}%` | `${number}vh` | `${number}vw` | `${number}em` | `${number}rem`

/** utility type to make some parameters of a type optional. */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

/** Utility to enforce a potential `undefined` in a Record (for when key does not exist) */
export type SparseRecord<K extends PropertyKey, V> = Partial<Record<K, V>>;
// NOTE: Consider refactoring to incorporate the `noUncheckedIndexedAccess` TS configuration option instead.

/** Utility type to force TypeScript to suggest some strings first, but allow any strings */
export type SuggestedString<T extends string> = T | (string & {});