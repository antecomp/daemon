import { TextOverlaySequence } from "@/layers/textoverlay/TextOverlay"
import { color } from "@/hooks/createColorTypewriter";

const openingTextScene: TextOverlaySequence = [
    ["It's a typical edge node. Or, it boasts itself as one."],
    ["To the average tourist, this bar is as close to the", color(" Fringe ", "red"), "as anyone can, or is willing, to go"],
    ["I understand the appeal, it's thrilling."],
    ["It's an act of rebellion against the corporate-washed fragments of", color(" Nullspace.", "red")],
    ["But this place is just as manufactured as any other."],
    ["These unnatural walls provide a reminder of that."],
    ["Could be why they meet here. It feels too obvious as a location."],
    ["I suppose that gives it strength."],
    ["It helps that most don't understand the irony of this bar in our eyes."],
    ["They know it's nothing like the real Fringe."],
    ["But they enjoy being taunted. It motivates them."],
    ["I know the same temptation."],
]

export default openingTextScene;
