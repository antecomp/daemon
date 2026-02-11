import { BattleOutcome } from "@/core/battle/model/battle";
import { createDialogueBuilder } from "@/core/dialogue/dialogueBuilder";
import { EMPTY_RENDER } from "@/core/dialogue/dialogueNode";
import { OPPONENT_FOX } from "@/data/battles/fox";
import { startBattle } from "@/features/battle/startBattle";
import sleep from "@/shared/utils/sleep";

// just some bullshit placeholder text rn.

const UNKNOWN = "???";
const FOX = "The Zenko";

const root = createDialogueBuilder("Hello Arda.", UNKNOWN);

root
    .makeNodeWaitFor(() => sleep(500))
    .chain("I'm afaid I must stop you here.")
    .questionLoop(
        // Should never see the exhaustion one.
        EMPTY_RENDER, EMPTY_RENDER, 'Let me through', [
        {
            id: "you",
            option: "What are you?",
            answer: "I am what you people call a Zenko.",
            builder: r => r.t("Some yapping...", FOX)
        },
        {
            id: "name",
            option: "How did you know my name?",
            answer: "idk."
        }
    ])
    .then("I shall only let you through if you can prove your strength!")
    .addOption(["[FIGHT!]", ""], undefined, undefined, 
        {'sideEffect': ctx => startBattle(OPPONENT_FOX).then(outcome => (outcome === BattleOutcome.PlayerVictory) && ctx?.actions?.removeFox())}
    );

export default root.unwrap();