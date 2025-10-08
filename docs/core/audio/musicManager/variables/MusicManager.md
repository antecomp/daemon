[**daemon**](../../../../README.md)

***

# Variable: MusicManager

> `const` **MusicManager**: `object`

Defined in: [src/core/audio/musicManager.ts:111](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/audio/musicManager.ts#L111)

The `MusicManager` is responsible for managing a stack of music tracks.
It provides methods to add, remove, and manipulate tracks in the stack,
as well as access the current state of the stack and the currently playing track

Whatever track at the top of the stack will automatically play on loop.

Methods:
- `pushTrack(entry: Omit<MusicTrackEntry, 'id'>): MusicTrackEntry`:
  Adds a new track to the stack. The track is wrapped in a mutable object
  and assigned a unique ID. Returns the newly created mutable object (allowing for reactive updates).

- `removeTrack(id: string): void`:
  Removes a track from the stack by its ID.

- `wipeTracks(): void`:
  Clears all tracks from the stack.

- `_debug_pop(): void`:
  Removes the last track from the stack. This is intended for debugging purposes.

Getters:
- `stack: MusicTrackEntry[]`:
  Returns the current stack of tracks.

- `currentTrack: MusicTrackEntry | null`:
  Returns the track at the top of the stack (the currently playing track),
  or `null` if the stack is empty.

## Type Declaration

### currentTrack

#### Get Signature

> **get** **currentTrack**(): [`MusicTrackEntry`](../type-aliases/MusicTrackEntry.md)

##### Returns

[`MusicTrackEntry`](../type-aliases/MusicTrackEntry.md)

### stack

#### Get Signature

> **get** **stack**(): `Accessor`\<[`MusicTrackEntry`](../type-aliases/MusicTrackEntry.md)[]\>

##### Returns

`Accessor`\<[`MusicTrackEntry`](../type-aliases/MusicTrackEntry.md)[]\>

### \_debug\_pop()

> **\_debug\_pop**(): `void`

#### Returns

`void`

### pushTrack()

> **pushTrack**(`entry`): [`MusicTrackEntry`](../type-aliases/MusicTrackEntry.md)

#### Parameters

##### entry

`Omit`\<[`MusicTrackEntry`](../type-aliases/MusicTrackEntry.md), `"id"`\>

#### Returns

[`MusicTrackEntry`](../type-aliases/MusicTrackEntry.md)

### removeTrack()

> **removeTrack**(`id`): `void`

#### Parameters

##### id

`string`

#### Returns

`void`

### wipeTracks()

> **wipeTracks**(): `void`

#### Returns

`void`
