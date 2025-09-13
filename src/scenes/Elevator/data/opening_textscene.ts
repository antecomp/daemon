import { TextOverlaySequence } from "@/layers/textoverlay/TextOverlay"
import { color } from "@/hooks/createColorTypewriter";

const openingTextScene: TextOverlaySequence = [
    { line: ["It's a typical edge node. Or, it boasts itself as one."] },
    { line: ["To the average tourist, this bar is as close to the", color(" Fringe ", "red"), "as anyone can, or is willing, to go"] },
    { line: ["I understand the appeal, it's thrilling."] },
    { line: ["It's an act of rebellion against the corporate-washed fragments of", color(" Nullspace.", "red")] },
    { line: ["But this place is just as manufactured as any other."] },
    { line: ["These unnatural walls provide a reminder of that."] },
    { line: ["Could be why they meet here. It feels too obvious as a location to meet."] },
    { line: ["I suppose that gives it strength."] },
    { line: ["It helps that most don't understand the irony of this location in our eyes."] },
    { line: ["They know it's nothing like the real Fringe."] },
    { line: ["But they enjoy being taunted. It motivates them."] },
    { line: ["I know the same temptation."] },
]

export default openingTextScene;
