import { setCurrentScene } from "@/app/shell/scene-container/SceneContainer";
import { TextOverlaySequence } from "@/features/text-overlay/TextOverlay";

const decrypt_textscene: TextOverlaySequence = [
    ['I feel a jolt in the back of my skull-'],
    ["-and my vision blurs as my ", ['VI-LINK', 'red'], ' resets.'],
    ["Once I come to, I read the contents of the diskette again."],
    ["Whatever code ran deleted itself, the cache only contains some coordinates and nothing else."],
    {segments: [['"This must be the spot"', 'yellow'], "\n I say to myself."], sideEffect() {setCurrentScene('Bridge')}}
    // Consider something along the lines of "I enter the coordinates into my navigator... Indicate movement and the passage of time better."
]

export default decrypt_textscene;