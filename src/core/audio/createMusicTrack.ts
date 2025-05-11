import { onCleanup } from "solid-js";
import { MusicManager, MusicTrackEntry } from "./musicManager";


/**
 * Hook that creates a new music track and registers it with the MusicManager.
 * Automatically cleans up the track by removing it when the associated
 * cleanup function is triggered.
 * 
 * To be used to add music associated with components (f.e scenes, battles...)
 *
 * @param entry - The music track entry data, excluding the `id` field.
 * @returns The created music track object with its assigned `id`.
 *          Returned track object is wrapped in a mutable, allowing for
 *          reactive updates.
 */
export function createMusicTrack(entry: Omit<MusicTrackEntry, "id">) {
    const track = MusicManager.pushTrack(entry);

    onCleanup(() => {
        MusicManager.removeTrack(track.id);
    })

    return track;
}