[**daemon**](../../../../README.md)

***

# Type Alias: StartDialogueOptions

> **StartDialogueOptions** = `object`

Defined in: [src/core/dialogue/dialogueService.tsx:15](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueService.tsx#L15)

Interface representing the options for starting a dialogue.

## Properties

### blockBehind?

> `optional` **blockBehind**: `boolean`

Defined in: [src/core/dialogue/dialogueService.tsx:17](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueService.tsx#L17)

Indicates if interactions with layers behind this one are blocked.

***

### ctx?

> `optional` **ctx**: [`DialogueContext`](../../dialogueNode.types/interfaces/DialogueContext.md)

Defined in: [src/core/dialogue/dialogueService.tsx:18](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueService.tsx#L18)

***

### overlay?

> `optional` **overlay**: `string`

Defined in: [src/core/dialogue/dialogueService.tsx:16](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueService.tsx#L16)

The image overlay (url) to be displayed during the dialogue.
