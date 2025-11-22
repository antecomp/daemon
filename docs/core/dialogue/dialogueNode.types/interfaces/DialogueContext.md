[**daemon**](../../../../README.md)

***

# Interface: DialogueContext

Defined in: [src/core/dialogue/dialogueNode.types.ts:10](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L10)

Context data passed from Hermes (and the caller by proxy) to each dialogue node at render/usage, allows passing local context to the dialogue at runtime

## Properties

### actions?

> `optional` **actions**: `Record`\<`string`, () => `void`\>

Defined in: [src/core/dialogue/dialogueNode.types.ts:13](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L13)

***

### flags?

> `optional` **flags**: `Record`\<`string`, `string` \| `number` \| `boolean`\>

Defined in: [src/core/dialogue/dialogueNode.types.ts:11](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L11)

***

### signals?

> `optional` **signals**: `Record`\<`string`, `Accessor`\<`any`\>\>

Defined in: [src/core/dialogue/dialogueNode.types.ts:12](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueNode.types.ts#L12)
