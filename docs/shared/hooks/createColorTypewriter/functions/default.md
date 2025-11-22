[**daemon**](../../../../README.md)

***

# Function: default()

> **default**(`input`, `__namedParameters`): `object`

Defined in: [src/shared/hooks/createColorTypewriter.tsx:58](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/shared/hooks/createColorTypewriter.tsx#L58)

Create a typewriter animation for colored text segments.

Performance
- Uses direct string slicing (ASCII-only assumption for slicing).
- Uses a single `shown` counter signal to drive updates.
- Avoids creating per-character elements; only updates span textContent.

## Parameters

### input

() => [`SegmentInput`](../type-aliases/SegmentInput.md)[]

Accessor returning an array of segments (string | [text,color] | {text,color?}).
             When this accessor changes, the animation restarts for the new content.

### \_\_namedParameters

`TypewriterOptions` = `{}`

## Returns

`object`

- display: JSX fragment to render the animated text.
 - skipTypingAnimation: reveals all remaining text and triggers onComplete if needed.
 - isFinished: accessor indicating whether the full text is visible.

### display()

> **display**: () => `Element`

#### Returns

`Element`

### isFinished

> **isFinished**: `Accessor`\<`boolean`\>

### skipTypingAnimation()

> **skipTypingAnimation**: () => `void`

#### Returns

`void`
