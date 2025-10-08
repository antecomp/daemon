[**daemon**](../../../../README.md)

***

# Function: createMusicTrack()

> **createMusicTrack**(`entry`): [`MusicTrackEntry`](../../musicManager/type-aliases/MusicTrackEntry.md)

Defined in: [src/core/audio/createMusicTrack.ts:17](https://github.com/antecomp/daemon/blob/2fc813cd9c751feb9d80fda2b87283821807ef97/src/core/audio/createMusicTrack.ts#L17)

Hook that creates a new music track and registers it with the MusicManager.
Automatically cleans up the track by removing it when the associated
cleanup function is triggered.

To be used to add music associated with components (f.e scenes, battles...)

## Parameters

### entry

`Omit`\<[`MusicTrackEntry`](../../musicManager/type-aliases/MusicTrackEntry.md), `"id"`\>

The music track entry data, excluding the `id` field.

## Returns

[`MusicTrackEntry`](../../musicManager/type-aliases/MusicTrackEntry.md)

The created music track object with its assigned `id`.
         Returned track object is wrapped in a mutable, allowing for
         reactive updates.
