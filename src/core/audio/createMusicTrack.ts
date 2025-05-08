import { onCleanup } from "solid-js";
import { MusicManager, MusicTrackEntry } from "./musicManager";

export function createMusicTrack(entry: Omit<MusicTrackEntry, "id">) {
    const track = MusicManager.pushTrack(entry);

    onCleanup(() => {
        MusicManager.removeTrack(track.id);
    })

    return track;
}