[**daemon**](../../../../README.md)

***

# Type Alias: DialogueNode

> **DialogueNode** = `object`

Defined in: [src/core/dialogue/dialogueNode.types.ts:49](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L49)

A DialogueNode represents a single "message" within a dialogue tree. You can generate a completely new one with the createDialogueNode FF (this is done for a root node).

However, the main strength of DialogueNode is it's helper methods. Every DialogueNode provides methods that allow you to automatically generate and attach children nodes.
Furthermore, each of these methods return the newly created nodes, allowing you to chain multiple helpers together to quickly build dialogue trees.

Generally, refer to the JSDoc for the createDialogueNode and helper methods here instead of the node itself. You should never be declaring a node manually.

## Properties

### id

> **id**: `string`

Defined in: [src/core/dialogue/dialogueNode.types.ts:50](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L50)

Internal tracking of dialogue nodes for keying and visualization. This should never be changed.

***

### name

> **name**: `string`

Defined in: [src/core/dialogue/dialogueNode.types.ts:51](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L51)

who is speaking.

***

### next?

> `optional` **next**: `DialogueNode` \| (`ctx?`) => `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:55](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L55)

pointer to the subsequent node, typically a child DialogueNode, but this can also loop/point to other parts of the Dialogue Graph.

***

### options

> **options**: [`DialogueOption`](../interfaces/DialogueOption.md)[]

Defined in: [src/core/dialogue/dialogueNode.types.ts:54](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L54)

an array of "options" ({summaryText, fullText, next}), these are the players response-points, forks in the dialogue tree.

***

### render

> **render**: [`DialogueRender`](DialogueRender.md)

Defined in: [src/core/dialogue/dialogueNode.types.ts:52](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L52)

a string or a method that returns a string, represents the actual message content being sent. The method that returns a string type is if you want to make the messages change their content based on game-state, or if you want to use helpers such as pickRandom().

***

### sideEffect()?

> `optional` **sideEffect**: (`ctx?`) => `void`

Defined in: [src/core/dialogue/dialogueNode.types.ts:56](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L56)

method that runs whenever a dialogue node renders, allows you to update game state based on dialogue events.

#### Parameters

##### ctx?

[`DialogueContext`](../interfaces/DialogueContext.md)

#### Returns

`void`

***

### waitFor()?

> `optional` **waitFor**: (`ctx?`) => `Promise`\<`void`\>

Defined in: [src/core/dialogue/dialogueNode.types.ts:62](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L62)

Blocking side effect, halts dialogue flow until promise resolves,
can be used to await camera movement, battles, cutscenes etc
without terminating dialoguue.

#### Parameters

##### ctx?

[`DialogueContext`](../interfaces/DialogueContext.md)

#### Returns

`Promise`\<`void`\>

## Methods

### addBackAndFourthChain()

> **addBackAndFourthChain**(`messages`, `first`, `second`): `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:148](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L148)

Generates a message chain where the names are set to alternate between two values automatically. Used for back-and-fourth dialogue.

#### Parameters

##### messages

[`DialogueRender`](DialogueRender.md)[]

Array of messages

##### first

`string`

First person to speak (name)

##### second

`string`

Next person to speak (name)

#### Returns

`DialogueNode`

ref to the last node in the chain

***

### addCAROptionChild()

> **addCAROptionChild**(`summaryText`, `fullText`, `response`, `senderName?`, `responderName?`, `optionConfig?`): `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:112](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L112)

"Call and Response" - render a node for summaryText and add it as a node, then attach an immediate response node as another child.

#### Parameters

##### summaryText

`string`

Text for the options quick representation

##### fullText

`string`

Full previewed text in the dialogue box - For CaR this will also be the message sent. The "call"

##### response

[`RenderOrNode`](RenderOrNode.md)

existing node or 'render' that is navigated to by this option. Defaults to the sender that this option is attached to.

##### senderName?

`string`

name attached to the "caller" (first person 99% of the time), defaults to config.DEFAULT_DIALOGUE_SENDER if none provided.

##### responderName?

`string`

name attached to the "response" text, if we're creating a new node for it.

##### optionConfig?

[`DialogueOptionConfig`](../interfaces/DialogueOptionConfig.md)

#### Returns

`DialogueNode`

Ref to the "response" child.

***

### addCAROptions()

> **addCAROptions**(`carOptions`): `DialogueNode`[]

Defined in: [src/core/dialogue/dialogueNode.types.ts:126](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L126)

Allows adding multiple Call-and-Response (CAR) options at once.

#### Parameters

##### carOptions

`object`[]

Array of { summaryText, fullText, response, senderName?, responderName? }

#### Returns

`DialogueNode`[]

- Array of created response DialogueNodes

***

### addChild()

> **addChild**(`child`, `name?`): `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:71](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L71)

Attach a new or existing child DialogueNode to the node

#### Parameters

##### child

[`RenderOrNode`](RenderOrNode.md)

Either an existing node made somewhere else (reference) or a 'render' representing a new message
  - when just a render is passed, the child will inherit the sender name from the current node.

##### name?

`string`

name to attach to the new message. If none provided, it will inherit from the parent.

#### Returns

`DialogueNode`

node - a reference to the newly created dialogue node

***

### addChildAsOption()

> **addChildAsOption**(`summaryText`, `fullText`, `child`, `name?`, `optionConfig?`): `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:81](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L81)

Attach a new or existing child Dialogue node as the result of a dialogue option.

#### Parameters

##### summaryText

`string`

Text for the options quick representation

##### fullText

`string`

Full previewed text in the dialogue box

##### child

[`RenderOrNode`](RenderOrNode.md)

This is what's actually spawned by selecting an option. Existing node or 'render' that is navigated to by this option.

##### name?

`string`

When creating a new node, name to attach to it. If none provided it will inherit from the parent.

##### optionConfig?

[`DialogueOptionConfig`](../interfaces/DialogueOptionConfig.md)

#### Returns

`DialogueNode`

ref to the child node

***

### addChildAsOptionIf()

> **addChildAsOptionIf**(`condition`, `option`): `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:192](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L192)

Attach an option when condition is met

#### Parameters

##### condition

`boolean`

boolean that determines if the option should be attached

##### option

summaryText, fullText, next: RenderOrNode, name

###### fullText

`string`

###### name?

`string`

###### next

[`RenderOrNode`](RenderOrNode.md)

###### optionConfig?

[`DialogueOptionConfig`](../interfaces/DialogueOptionConfig.md)

###### summaryText

`string`

#### Returns

`DialogueNode`

- the parent node (this)

***

### addChildIf()

> **addChildIf**(`condition`, `child`): `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:179](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L179)

Conditionally attach a child dialogue node, when a child doesn't already exist.

These can be chained for multiple conditions, the first one that is true will be attached.

#### Parameters

##### condition

`boolean`

boolean that determines if the child should be attached

##### child

[`RenderOrNode`](RenderOrNode.md)

render or node to attach if the condition is true

#### Returns

`DialogueNode`

- the parent node (this) <- Be careful when chaining! This won't return the child!

***

### addFallbackChild()

> **addFallbackChild**(`child`): `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:185](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L185)

Attach a faillback child dialogue node if one doesn't exist, and if there's no options (usually chained with .if)

#### Parameters

##### child

[`RenderOrNode`](RenderOrNode.md)

render or node to attach if no other child is attached (all conditions are false)

#### Returns

`DialogueNode`

- the parent node (this) <- Be careful when chaining! This won't return the child!

***

### addFallbackChildAsOption()

> **addFallbackChildAsOption**(`option`): `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:198](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L198)

Attach fallback option if none exist and no "next" is specified (used in conjunction with addOptionIf, addChildIf, etc)

#### Parameters

##### option

summaryText, fullText, next: RenderOrNode, name

###### fullText

`string`

###### name?

`string`

###### next

[`RenderOrNode`](RenderOrNode.md)

###### optionConfig?

[`DialogueOptionConfig`](../interfaces/DialogueOptionConfig.md)

###### summaryText

`string`

#### Returns

`DialogueNode`

- the parent node (this)

***

### addMessageChain()

> **addMessageChain**(`messages`): `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:139](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L139)

Quickly append a chain of messages as a simple array.

#### Parameters

##### messages

([`DialogueRender`](DialogueRender.md) \| \{ `name`: `string`; `render`: [`DialogueRender`](DialogueRender.md); \})[]

Array of either Dialogue Node Render-ers (string or function that returns a string) or obj of {name, render} for adapting the name

#### Returns

`DialogueNode`

ref to the last node in the chain.

***

### addOptions()

> **addOptions**(`options`): `DialogueNode`[]

Defined in: [src/core/dialogue/dialogueNode.types.ts:94](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L94)

Allows adding multiple options at once.

#### Parameters

##### options

`object`[]

Array of { summaryText, fullText, child, name? }

#### Returns

`DialogueNode`[]

- Array of created DialogueNodes

***

### addTerminationOption()

> **addTerminationOption**(`summaryText`, `fullText`, `optionConfig?`): `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:170](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L170)

Add a option that ends the dialogue with custom text.

#### Parameters

##### summaryText

`string`

##### fullText

`string`

Note - you wont see this message sent, as the dialogue will terminate immediately, this is just for the typed preview.

##### optionConfig?

[`DialogueOptionConfig`](../interfaces/DialogueOptionConfig.md)

#### Returns

`DialogueNode`

the node back (this) for chaining.

***

### attachSideEffect()

> **attachSideEffect**(`ef`): `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:155](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L155)

Attach a "side effect" (additional function) that will run when a node is rendered. Returns a ref back to the node.

#### Parameters

##### ef

(`ctx?`) => `void`

The CB to run when the node is entered. ef takes a generic "context" object that can be used to reference other game methods

#### Returns

`DialogueNode`

the node back (this) for chaining

***

### makeNodeWaitFor()

> **makeNodeWaitFor**(`wf`): `DialogueNode`

Defined in: [src/core/dialogue/dialogueNode.types.ts:162](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.types.ts#L162)

Attach a "waitFor" async CB, a method that blocks dialogue flow until the promise resolves.

#### Parameters

##### wf

(`ctx?`) => `Promise`\<`void`\>

#### Returns

`DialogueNode`

this node back for chaining.
