[**daemon**](../../../../README.md)

***

# Function: default()

> **default**(`inputText`, `delay`, `onComplete`): `object`

Defined in: [src/shared/hooks/createTypewriter.ts:13](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/shared/hooks/createTypewriter.ts#L13)

Typewriter effect for progressively revealing text.

## Parameters

### inputText

() => `string`

The text to type out. Animation automatically triggers when this changes.

### delay

`number` = `50`

Delay between each character (in ms)

### onComplete

() => `void`

Callback function when typing completes

## Returns

`object`

displayText - Signal holding the current typed string

### displayText

> **displayText**: `Accessor`\<`string`\>

### isFinished

> **isFinished**: `Accessor`\<`boolean`\>

### skipTypingAnimation()

> **skipTypingAnimation**: () => `void`

#### Returns

`void`
