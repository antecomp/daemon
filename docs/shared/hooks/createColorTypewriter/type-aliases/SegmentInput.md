[**daemon**](../../../../README.md)

***

# Type Alias: SegmentInput

> **SegmentInput** = `string` \| \[`string`, `string`\] \| \{ `color?`: `string`; `text`: `string`; \}

Defined in: [src/shared/hooks/createColorTypewriter.tsx:9](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/shared/hooks/createColorTypewriter.tsx#L9)

Flexible segment input:
- string: uncolored text
- [text, color]: tuple helper form, e.g. ["word", "tomato"]
- { text, color? }: legacy object form <- slated for removal.
