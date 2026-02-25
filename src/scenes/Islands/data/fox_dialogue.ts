import { createDialogueBuilder } from "@/core/dialogue/dialogueBuilder";
import { VISUALIZER } from "@/core/dialogue/dialogueNode";

const FOX = "A Rogue Zenko";

const doyouthink = createDialogueBuilder("Do you think that now, just because you can see me that you're strong?", FOX);
doyouthink
    .chain(
        "That you're welcome here?",
        "I will let you leave this place, but the others will not show the same mercy.",
        "The woman I found in the sunlit rain won't let me eat you.",
        "But the others... the others are proper daemons.",
        "They only wish to grow.",
        "I have grown enough. And I don't want to see anyone else devoured.",
        "Especially not in the name of that horrid scarecrow."
    )
    .car(
        ['Let me through.', 'I did not come this far just to turn around.'], 
        "I was afraid you'd say that. You strays are always so incredibly arrogant."
    )
    .then(
        "Very well, prove yourself now, while you still won't loose your head over it."
    )
    .addOption(["[FIGHT]", ''], undefined, undefined, {sideEffect(ctx){ctx?.actions?.foxBattle?.()}})



const root = createDialogueBuilder("Hello, Arda. I'm afraid I must stop you here.", FOX);
root
    .then('I suppress thousands of errors spewing from my VI-LINK, and struggle to keep my composure.', VISUALIZER)
    .addCar('How do you know my name?', ["Just because you are blind to something doesn't mean it also cannot see you.", FOX], r => r.then(doyouthink.unwrap()))
    .addCar(['Why', 'And why is that?'], doyouthink.unwrap());

export default root.unwrap();