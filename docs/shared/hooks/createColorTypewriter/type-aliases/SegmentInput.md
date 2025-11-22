[**daemon**](../../../../README.md)

***

# Type Alias: SegmentInput

> **SegmentInput** = `string` \| \[`string`, `string`\] \| \{ `color?`: `string`; `text`: `string`; \}

Defined in: [src/shared/hooks/createColorTypewriter.tsx:9](https://github.com/antecomp/daemon/blob/47daeacebcabea5a8994386f75146796a04a9331/src/shared/hooks/createColorTypewriter.tsx#L9)

Flexible segment input:
- string: uncolored text
- [text, color]: tuple helper form, e.g. ["word", "tomato"]
- { text, color? }: legacy object form <- slated for removal.
