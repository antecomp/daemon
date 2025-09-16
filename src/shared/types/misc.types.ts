
export interface AssArray<T> {
    [key: string]: T;
}/** alias to string for intention readability - represents a imported asset that resolves to a URL when built */
export type AssetURL = string
/** Common CSS units attached to numbers. */
export type CSSUnit = `${number}px` | `${number}%` | `${number}vh` | `${number}vw` | `${number}em` | `${number}rem`

