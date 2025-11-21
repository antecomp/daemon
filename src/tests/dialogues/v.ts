import { createDialogueBuilder, DialogueNodeBuilder, EMPTY_RENDER, inline } from "@/core/dialogue/dialogueBuilder";
import pickRandom from "@/shared/utils/pickRandom";
import sleep from "@/shared/utils/sleep";

const ARDA = "Arda";
const VIYA = "Viya";

const root = createDialogueBuilder("Hey, welcome to daemon.garden", VIYA);

// After a question we have a loopback point. Let's just declare it here for convenience.
const questionLoopback = createDialogueBuilder(() => pickRandom(["Go for it.", "I'll try my best.", "Alright"]), VIYA);
const questionLoopIntermediary = createDialogueBuilder("Any more questions?", VIYA);
questionLoopIntermediary.car("Yes", "Yes", questionLoopback.node);
questionLoopIntermediary.option(["Nah [END DIALOGUE]", "Nah"]); // Option with no destination just terminates the dialogue.

root.makeNodeWaitFor(async () => await sleep(1000)) // We can enforce autoadvance with a delay by doing this!

const questions = root.next("I imagine you have a lot of questions right now.");
questions.car("Yes", "Yes I do.", questionLoopback.node);
questions.option("No [END CONVERSATION]", "Nah not really.");

let what_is_this_game!: DialogueNodeBuilder;

// THIS FUCKING THING IS GIVING ME CANCER. MY SYSTEM HAS NOT IMPROVED AT ALL AND I WILL BURN IN HELL FOR MY SINS.
// HOURS WASTED: 4


questionLoopback
    .option(
        ['What', 'What...'],
        inline(EMPTY_RENDER, EMPTY_RENDER,
            whatbranch => {
                whatbranch.car(
                    'Game', 'What is this game?',
                    inline(
                        'daemon.garden is a point & click RPG created by omni.vi', VIYA,
                        game => game
                            .do(b => what_is_this_game = b)
                            .chain("Episode 0 takes place in the year 2095", "Long after the 'VI-LINK' has become widespread.")
                            .addCarBranch(
                                'VI-LINK?', 'What is a VI-LINK?',
                                "The VI-LINK is a neural-interface that allows users to connect to NULLSPACE."
                            )
                            .addCarBranch('Cool', 'Cool.', "Yeah :)")
                            .addCarBranch('Lame.', "Sounds boring and LARP-ey", "Okay buddy.")
                            .joinBranches(questionLoopIntermediary.node)
                    )
                )
                whatbranch.car(
                    "This", "What is this?",
                    inline("This as in...?", VIYA,
                        whatthis => {
                            whatthis.car("Game", "This game.", what_is_this_game.node)
                            return whatthis.car(
                                "Dialogue", "This Dialogue System",
                                inline(
                                    "The dialogue system we're using right now is called Hermes", VIYA,
                                    fuckoff => fuckoff.chain("It was made in-house by omni", "and uses a lot of stupid code to make dialogue I hate it.").next(questionLoopIntermediary.node)
                                )
                            )
                        }
                    )
                )
            }
        )
    )

export default root.unwrap();