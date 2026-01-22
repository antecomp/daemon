import { setCurrentScene } from "@/app/shell/scene-container/SceneContainer";
import { TextOverlaySequence } from "@/features/text-overlay/TextOverlay";

const decrypt_textscene: TextOverlaySequence = [
    ['I feel a jolt in the back of my skull-'],
    {segments: ["-and my vision blurs as my ", ['VI-LINK', 'red'], ' resets.'], sideEffect() {setCurrentScene('Bridge')}},
    ["Once I come to, I read the contents of the diskette again."],
    ["Whatever code ran deleted itself, the cache only contains some coordinates and nothing else."],
    [['"This must be the meeting spot"', 'teal'], "I say to myself."]
]

export default decrypt_textscene;