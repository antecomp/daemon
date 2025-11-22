import { createDialogueBuilder } from "@/core/dialogue/dialogueBuilder";

const X = "Speaker"

const root = createDialogueBuilder("This is the root node", X);

root
    .then("This is some child node")
    .then("Do you have any questions?")
    .questionLoop(
        'Any more questions?',
        'There are no questions left.',
        ['End Q', "I'm done asking questions."],
        [
            {
            id: "1",
            option: "Question 1",
            answer: "Answer to question 1"
            },
            {
                id: "2",
                option: ['Q2', "Asking question two..."],
                answer: "Root of question 2 answer",
                builder: r => r
                    .then("Continuining answer to question 2 with subtree")
                    .chain("egg", "pasta")
            },
            {
                id: "3",
                option: "Question 3",
                answer: "I am going fucking insane.",
                builder: r => r
                    .then("Not my problem, buster.", "Arda")
            },
            {
                id: "Followup",
                option: ['Followup', 'I have a question with a followup.'],
                answer: "Okay buster",
                builder: r => r
                    .addCarBranch(
                        "Followup A",
                        "Nice followup, where did you get it? The followup store?",
                    )
                    .addCarBranch(
                        "Followup B",
                        "I eat rocks",
                        r => r
                            .then("And stones.")
                            .then("And other various minerals.")
                    )
                    .joinBranches("Anyways...")
            }
        ]
    )
    .then("This will show after the question loop concludes.")

export default root.unwrap();