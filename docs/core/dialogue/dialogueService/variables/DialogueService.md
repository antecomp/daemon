[**daemon**](../../../../README.md)

***

# Variable: DialogueService

> `const` **DialogueService**: `object`

Defined in: [src/core/dialogue/dialogueService.tsx:65](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueService.tsx#L65)

## Type Declaration

### currentDialogueOverlay

> **currentDialogueOverlay**: `Accessor`\<`null` \| `string`\>

### dialogueOngoing()

> **dialogueOngoing**: () => `boolean`

#### Returns

`boolean`

### endDialogue()

> **endDialogue**: () => `void`

End the current dialogue instance.

#### Returns

`void`

### setCurrentDialogueOverlay

> **setCurrentDialogueOverlay**: `Setter`\<`null` \| `string`\>

### startDialogue()

> **startDialogue**: (`rootNode`, `options?`) => `Promise`\<`void`\>

Launch a new Hermes instance (new dialogue sequence).

#### Parameters

##### rootNode

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

##### options?

[`StartDialogueOptions`](../type-aliases/StartDialogueOptions.md)

Start dialogue options (all optional), reference type definition for more details

#### Returns

`Promise`\<`void`\>

#### Throws

"Dialogue already in progress" error if there's already an active dialogue.
