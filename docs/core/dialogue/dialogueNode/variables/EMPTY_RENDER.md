[**daemon**](../../../../README.md)

***

# Variable: EMPTY\_RENDER

> `const` **EMPTY\_RENDER**: `""` = `""`

Defined in: [src/core/dialogue/dialogueNode.ts:206](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/dialogue/dialogueNode.ts#L206)

Empty string "" indicates to Hermes that no message should be shown. 
This can be used to traverse the dialogue tree without adding new messages,
for example this is useful when questions need to be chained together, without a "message" being sent for each piece;

## Example

```ts
const whatFork = questionLoopback.addChildAsOption("What...", "What...", EMPTY_RENDER);
whatFork.addChildAsOption( questions can go here...)
```
