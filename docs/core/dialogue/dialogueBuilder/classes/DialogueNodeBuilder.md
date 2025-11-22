[**daemon**](../../../../README.md)

***

# Class: DialogueNodeBuilder

Defined in: [src/core/dialogue/dialogueBuilder.ts:12](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L12)

DialogueNodeBuilder is a wrapper class for DialogueNode that allows 
for construction of dialogue trees using several utility functions.

## Remark

- If you are trying to start a new dialogue tree with some render/name, use the factory function `createDialogueBuilder` instead.

## Constructors

### Constructor

> **new DialogueNodeBuilder**(`node`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:13](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L13)

#### Parameters

##### node

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

#### Returns

`DialogueNodeBuilder`

## Properties

### node

> `readonly` **node**: [`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

Defined in: [src/core/dialogue/dialogueBuilder.ts:13](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L13)

## Methods

### addBranch()

> **addBranch**(`optionText`, `head`, `subtreeBuilder?`, `optionConfig?`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:242](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L242)

Generates a new **branch** for the dialogue system. Branches are option-attached subtrees 
in which the tail of is *cached* for the current builder. Allowing these tails to be unified later with merge or join branches.
Works in a similar fashion to addOption, but anticipates a connecting node.

#### Parameters

##### optionText

[`OptionConstructorText`](../../dialogueNode.types/type-aliases/OptionConstructorText.md)

Tuple of [summaryText, fullText], or, if both are the same, just a string.

##### head

Top of the branch to create (Existing node or a tuple of a dialogue render and name)

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md) | \[[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md), `string`\]

##### subtreeBuilder?

(`r`) => `DialogueNodeBuilder`

Callback that takes the head node and extends it into a subtree. Expected to return tail of created subtree.

##### optionConfig?

[`DialogueOptionConfig`](../../dialogueNode.types/interfaces/DialogueOptionConfig.md)

Additional config for the option, current used to attach `sideEffect`s and `onlyShowWhen` conditions.

#### Returns

`DialogueNodeBuilder`

`this` (for chaining)

***

### addCar()

> **addCar**(`call`, `response`, `subtreeBuilder?`, `optionConfig?`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:185](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L185)

Variant of `.car` that instead returns the current node (does not traverse into response tree). Used to chain car additions together.

"car" represents a "call and response," a streamlined way to make an option also send as a dialogue node, sent from the player (the "call")
and to automatically invoke some sort of connected "response" dialogue node connected to the call.
Used for easy send message -> get response style chains.

#### Parameters

##### call

[`OptionConstructorText`](../../dialogueNode.types/type-aliases/OptionConstructorText.md)

The option text to use for making the call. Either a tuple [summaryText, fullText], or, if they are the same, just a string.
     - the `fullText` will be used as the contents of the message sent by the player.

##### response

The node that will be attached to the "call" (player message) node. 
 - Can be an existing dialogue node.
 - Can be a tuple [DialogueRender, string] for a render and the name of the speaker (create a new dialogue node)
 - Can also just be a DialogueRender, where the name will be inherited from the node this is being attached to.

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md) | [`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md) | \[[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md), `string`\]

##### subtreeBuilder?

`DialogueSubtreeBuilder`

A callback for generating a subtree off of the response node. This callback is expected to return the *tail* of the created subtree to function properly.

##### optionConfig?

[`DialogueOptionConfig`](../../dialogueNode.types/interfaces/DialogueOptionConfig.md)

Additional config for the option, current used to attach `sideEffect`s and `onlyShowWhen` conditions.

#### Returns

`DialogueNodeBuilder`

- When just using `response`: Returns the created response node (traverses into it).
- When using a subtreeBuilder: Returns the tail of the created subtree.

***

### addCarBranch()

> **addCarBranch**(`call`, `response`, `subtreeBuilder?`, `optionConfig?`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:282](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L282)

Car variant of addBranch. Car stands for "call and response" - makes the option fullText a message sent by the player, immediately followed by some 'response' node.

#### Parameters

##### call

[`OptionConstructorText`](../../dialogueNode.types/type-aliases/OptionConstructorText.md)

The option text to use for making the call. Either a tuple [summaryText, fullText], or, if they are the same, just a string.
     - the `fullText` will be used as the contents of the message sent by the player.

##### response

The response node, also serves as the head of the subtree.

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md) | [`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md) | \[[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md), `string`\]

##### subtreeBuilder?

(`r`) => `DialogueNodeBuilder`

Callback that takes the response node and extends it into a subtree. Expected to return tail of created subtree.

##### optionConfig?

[`DialogueOptionConfig`](../../dialogueNode.types/interfaces/DialogueOptionConfig.md)

Additional config for the option, current used to attach `sideEffect`s and `onlyShowWhen` conditions.

#### Returns

`DialogueNodeBuilder`

`this` (for chaining)

#### Ref

`.car` method of this class for more details.

Generates a new **branch** for the dialogue system. Branches are option-attached subtrees 
in which the tail of is *cached* for the current builder. Allowing these tails to be unified later with merge or join branches.
Works in a similar fashion to addOption, but anticipates a connecting node.

***

### addOption()

> **addOption**(`optionText`, `entry?`, `subtreeBuilder?`, `optionConfig?`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:114](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L114)

Variant of `.option` that instead returns the current node (does not traverse into option tree). Used to chain option additions together.

Attaches a new option to the node, along with generating an optional connected node & subtree for that option.

#### Parameters

##### optionText

[`OptionConstructorText`](../../dialogueNode.types/type-aliases/OptionConstructorText.md)

Tuple of [summaryText, fullText], or, if both are the same, just a string.

##### entry?

(optional) - An existing (or render to make new) node that the option should connect to.

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md) | \[[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md), `string`\]

##### subtreeBuilder?

`DialogueSubtreeBuilder`

A subtreebuilder, which is a callback that takes the entry node and can run builder methods on it to create a subtree.
                        This method is expected to return the tail of the newely created subtree to function properly.

##### optionConfig?

[`DialogueOptionConfig`](../../dialogueNode.types/interfaces/DialogueOptionConfig.md)

Additional config for the option, current used to attach `sideEffect`s and `onlyShowWhen` conditions.

#### Returns

`DialogueNodeBuilder`

- `this`

***

### attachSideEffect()

> **attachSideEffect**(`ef`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:201](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L201)

Helper to attach a side effect to the current dialogue node.

#### Parameters

##### ef

(`ctx?`) => `void`

The side effect to attach, takes DialogueContext as an argument.

#### Returns

`DialogueNodeBuilder`

- `this` (to chain)

***

### car()

> **car**(`call`, `response`, `subtreeBuilder?`, `optionConfig?`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:142](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L142)

"car" represents a "call and response," a streamlined way to make an option also send as a dialogue node, sent from the player (the "call")
and to automatically invoke some sort of connected "response" dialogue node connected to the call.
Used for easy send message -> get response style chains.

#### Parameters

##### call

[`OptionConstructorText`](../../dialogueNode.types/type-aliases/OptionConstructorText.md)

The option text to use for making the call. Either a tuple [summaryText, fullText], or, if they are the same, just a string.
     - the `fullText` will be used as the contents of the message sent by the player.

##### response

The node that will be attached to the "call" (player message) node. 
 - Can be an existing dialogue node.
 - Can be a tuple [DialogueRender, string] for a render and the name of the speaker (create a new dialogue node)
 - Can also just be a DialogueRender, where the name will be inherited from the node this is being attached to.

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md) | [`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md) | \[[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md), `string`\]

##### subtreeBuilder?

`DialogueSubtreeBuilder`

A callback for generating a subtree off of the response node. This callback is expected to return the *tail* of the created subtree to function properly.

##### optionConfig?

[`DialogueOptionConfig`](../../dialogueNode.types/interfaces/DialogueOptionConfig.md)

Additional config for the option, current used to attach `sideEffect`s and `onlyShowWhen` conditions.

#### Returns

`DialogueNodeBuilder`

- When just using `response`: Returns the created response node (traverses into it).
- When using a subtreeBuilder: Returns the tail of the created subtree.

***

### chain()

> **chain**(...`messages`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:42](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L42)

Attach a sequence of dialogue nodes, created from any number of renders/nodes.

#### Parameters

##### messages

...[`RenderOrNode`](../../dialogueNode.types/type-aliases/RenderOrNode.md)[]

Any number of dialogue renders to be attached in sequence.

#### Returns

`DialogueNodeBuilder`

The node at the end of the chain (traverses into it).

#### Remark

- The nodes created by using chain inherit the name from the node they are being attached to.

***

### chainAlt()

> **chainAlt**(`first`, `second`, ...`messages`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:57](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L57)

Attaches a sequence of dialogue nodes, where the speakers are alternated (for back and fourth dialogue)

#### Parameters

##### first

`string`

Name of the speaker who sends the first message.

##### second

`string`

Name of the speaker who sends the second message.

##### messages

...[`RenderOrNode`](../../dialogueNode.types/type-aliases/RenderOrNode.md)[]

Remaining arguments are dialogue nodes/renders used for the stream of messages.

#### Returns

`DialogueNodeBuilder`

***

### do()

> **do**(`fn`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:466](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L466)

Helper to perform various tasks on the current dialogue node without traversal. (simply returns `this`)

#### Parameters

##### fn

(`b`) => `void`

Function that takes in the current node (to perform whatever actions)

#### Returns

`DialogueNodeBuilder`

- `this` (for chaining)

***

### joinBranches()

> **joinBranches**(`joinPoint`, `name?`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:317](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L317)

Joins all set branches to a single collapse node (as in, make the .next of each branches tail point to this node.)

#### Parameters

##### joinPoint

[`RenderOrNode`](../../dialogueNode.types/type-aliases/RenderOrNode.md)

The node to join to (either an existing node or a render to use)

##### name?

`string`

(optional) - Name used for the join node if creating a new one with a render. 
             If none is provided, the name is inherited from the node this join is attaching to.

#### Returns

`DialogueNodeBuilder`

- The new join node (traverses into it)

***

### makeNodeWaitFor()

> **makeNodeWaitFor**(`wf`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:211](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L211)

Helper to attach a `waitFor` to the current dialogue node.

#### Parameters

##### wf

(`ctx?`) => `Promise`\<`void`\>

The async blocking method to attach, takes DialogueContext as an argument.

#### Returns

`DialogueNodeBuilder`

`this` (to chain)

***

### mergeBranches()

> **mergeBranches**(`joinPoint`, `subtreeBuilder?`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:338](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L338)

A variant of `.joinBranches` that instead merges the current branches into a *new* singular branch instead, allowing for early join points.

#### Parameters

##### joinPoint

The node to join to (either an existing node or a render to use)

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md) | \[[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md), `string`\]

##### subtreeBuilder?

(`r`) => `DialogueNodeBuilder`

A subtree builder that starts off of the join point.

#### Returns

`DialogueNodeBuilder`

`this` (for chaining)

***

### option()

> **option**(`optionText`, `entry?`, `subtreeBuilder?`, `optionConfig?`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:77](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L77)

Attaches a new option to the node, along with generating an optional connected node & subtree for that option.

#### Parameters

##### optionText

[`OptionConstructorText`](../../dialogueNode.types/type-aliases/OptionConstructorText.md)

Tuple of [summaryText, fullText], or, if both are the same, just a string.

##### entry?

(optional) - An existing (or render to make new) node that the option should connect to.

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md) | \[[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md), `string`\]

##### subtreeBuilder?

`DialogueSubtreeBuilder`

A subtreebuilder, which is a callback that takes the entry node and can run builder methods on it to create a subtree.
                        This method is expected to return the tail of the newely created subtree to function properly.

##### optionConfig?

[`DialogueOptionConfig`](../../dialogueNode.types/interfaces/DialogueOptionConfig.md)

Additional config for the option, current used to attach `sideEffect`s and `onlyShowWhen` conditions.

#### Returns

`DialogueNodeBuilder`

- When just a connected node (entry) is provided: This returns that node (traverses into it).
 - When a subtreeBuilder is provided: This returns the tail of the generated subtree.
 - When no connected node/subtree is provided; this is a **termination option** (alias for ending dialogue). Thus will return the current node.

***

### questionLoop()

> **questionLoop**(`loopbackPrompt`, `exhausted`, `exitOption`, `questions`, `earlyExitMessage?`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:379](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L379)

questionLoop creates a self-contained looping subtree of "question" options in which...
 - when the player asks a question, this question has some associated answer (and subtree) which loops back to some loopback prompt (e.g "any more questions?")
-  when a question is answered, it is hidden as an option in subsequent loops.
- When all questions are exhausted, an "exhausted" message can be displayed and the loop is exited
- The question loop can be optionally allowed to exit early with some option (e.g "I am done asking questions").

#### Parameters

##### loopbackPrompt

The prompt node that is displayed when *looping back*. For example this is something like "any more questions?"

[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md) | \[[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md), `string`\]

##### exhausted

The node that is displayed when all questions have been exhausted.

[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md) | \[[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md), `string`\]

##### exitOption

(optional, can be `undefined`) An option to exit the questions early.

`undefined` | [`OptionConstructorText`](../../dialogueNode.types/type-aliases/OptionConstructorText.md)

##### questions

`object`[]

An array of questions that can be asked, where each question consists of...
     - `id` - A unique id for the question (used to track what has been asked)
     - `option` - The option info for the question. Either a [summary, fulltext] tuple, or, if they are the same, just a string.
     - `answer` - Render for the answer node.
     - `answerName` (optional) - Name to be associated with answer node. If none is provided, name in inherited from the node this question loop branches from.

##### earlyExitMessage?

(optional) - Message to render if the player uses the exitOption, often used for MC to send a message like "I am done asking questions now..."

[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md) | \[[`DialogueRender`](../../dialogueNode.types/type-aliases/DialogueRender.md), `string`\]

#### Returns

`DialogueNodeBuilder`

- An empty "exit node" from the loop, for traversing out of the question loop ending.

***

### t()

> **t**(`renderOrNode`, `name?`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:473](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L473)

#### Parameters

##### renderOrNode

[`RenderOrNode`](../../dialogueNode.types/type-aliases/RenderOrNode.md)

##### name?

`string`

#### Returns

`DialogueNodeBuilder`

***

### then()

> **then**(`next`, `name?`): `DialogueNodeBuilder`

Defined in: [src/core/dialogue/dialogueBuilder.ts:22](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L22)

Creates a new, or attaches an existing, child dialogue node.

#### Parameters

##### next

[`RenderOrNode`](../../dialogueNode.types/type-aliases/RenderOrNode.md)

Either a render (for creating a new dialogue node) or an existing dialogue node.

##### name?

`string`

(optional) A name to be used when creating a new dialogue node. 
             If none is supplied, the name is inherited from the node this is being attached to.

#### Returns

`DialogueNodeBuilder`

The attached dialogue node (traverses into it).

***

### unwrap()

> **unwrap**(): [`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

Defined in: [src/core/dialogue/dialogueBuilder.ts:221](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/core/dialogue/dialogueBuilder.ts#L221)

Extracts the DialogueNode instance contained within this wrapper class.
This is what you need to actually send off to startDialogue.

#### Returns

[`DialogueNode`](../../dialogueNode.types/type-aliases/DialogueNode.md)

The dialogue node associated with this builder.
