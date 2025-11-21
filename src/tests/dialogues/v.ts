import { BattleOutcome } from "@/core/battle/model/battle";
import { createDialogueBuilder, DialogueNodeBuilder, inline, makeDialogueNode } from "@/core/dialogue/dialogueBuilder";
import { EMPTY_RENDER } from "@/core/dialogue/dialogueNode";
import { OPPONENT_MIMICRY } from "@/data/battles/mimic";
import { startBattle } from "@/features/battle/startBattle";
import pickRandom from "@/shared/utils/pickRandom";
import sleep from "@/shared/utils/sleep";

const VIYA = "Viya";

// we can cache nodes for goto like this, maybe ill engineer something more clever later.
let whatIsThisGame!: DialogueNodeBuilder;
let battleOutcome: BattleOutcome;

const questionLoopback = createDialogueBuilder("Any more questions?", VIYA);
const questionsRoot = createDialogueBuilder(() => pickRandom(["Go for it.", "I'll try my best.", "Alright."]), VIYA);
questionLoopback
    .addCar(
        "Yes",
        questionsRoot.node
    )
    .addOption(
        ["No [END Conversation]", "Nah, not really"]
    );

const root = createDialogueBuilder("Hey, welcome to daemon.garden", VIYA);    
root
    .makeNodeWaitFor(_ => sleep(1000)) // Enforce a delay with auto-advance, instead of user input.
    .then("I imagine you have a lot of questions right now.")
    .addCar( "Yes", questionsRoot.node)
    .addOption( ["No [END Conversation]", "Nah, not really"])
    .addCar(
        ["Battle.", "No questions, start a battle with the mimicry please."],
        EMPTY_RENDER,
        battleFork => battleFork
            .makeNodeWaitFor(async () => {battleOutcome = await startBattle(OPPONENT_MIMICRY)})
            // this is still insanely gross but whatever.
            .do(wtf => wtf
                .node.next = () => {
                    switch(battleOutcome) {
                        case(BattleOutcome.PlayerVictory): return makeDialogueNode("Wow, nice job. I'm impressed.", VIYA);
                        case(BattleOutcome.OpponentVictory): return makeDialogueNode("Damn you suck at this. How are you going to survive the fringenet?", VIYA);
                        case(BattleOutcome.Draw): return makeDialogueNode("Close call! Things will only get harder from here...", VIYA);
                        case(BattleOutcome.PlayerEject): return inline("Coward", VIYA, cow => cow
                            .then("If you're not going to fight, do you at least have some questions?")
                            .addCar(["Yes", "Sure."], questionsRoot.node)
                            .addOption(['No [END]', "No fuck off"])
                        );
                        default: return makeDialogueNode("I'm not sure what the battle outcome is, something probably broke lol.", VIYA);
                    }
                }
            )
    );

questionsRoot
    .addOption(
        ["What", "What..."],
        [EMPTY_RENDER, VIYA], // sets the speaker inheritance right even tho this node actually wont be shown.
        whatFork => whatFork
            .addCar(
                ["Game?", "What is this game?"],
                'daemon.garden is a point-and-click RPG created by omni.vi',
                g => g
                    .do(g => whatIsThisGame = g) // Save this node for later reference.
                    .chain("Episode 0 takes place in the year 2095", "Long after the VI-LINK has become widespread.")
                    .addCar(
                        ['VI-LINK?', 'What is a VI-LINK?'],
                        "The VI-LINK is a neural-interface that allows users to connect to NULLSPACE",
                        r => r.then(questionLoopback.node)
                    )
                    .addCar(
                        "Cool.",
                        'Yeah :)',
                        r => r.then(questionLoopback.node)
                    )
                    .addCar(
                        ["Lame", "Sounds boring and LARP-ey"],
                        "Okay buddy",
                        r => r.then(questionLoopback.node)
                    )
            )
            .addCar(
                ["This?", "What is this?"],
                'This as in...?',
                t => t
                    .addCar(
                        ['Game', 'This game, I mean.'],
                        whatIsThisGame.node
                    )
                    .addCar(
                        ["Dialogue", "This dialogue system."],
                        "The dialogue system we're using right now is called Hermes",
                        d => d
                            .chain("It was made in-house by omni.", "it uses some really evil reference and callback magic to work.", "I am not sure if I like it.")
                            .then(questionLoopback.node)
                    )
            )
    )
    .addOption(
        ['Why', 'Why...'],
        [EMPTY_RENDER, VIYA],
        whyFork => whyFork
            .addCar(
                ['Game style', "Why does the game look like this?"],
                'Because it looks cool. What kind of question is that?',
                r => r.then(questionLoopback.node)
            )
    );

export default root.unwrap();