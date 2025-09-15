import { createDialogueNode, createInlineDialogueTree, VISUALIZER } from "@/core/dialogue/dialogueNode";

const root = createDialogueNode('His eyes dart and glimmer briefly behind his sunglasses - likely verifying my VLID.', VISUALIZER);

const chrs = {
    MAN: "The Man",
    ARDA: "Arda"
}

const richDaddy = root.addBackAndFourthChain(
    [
        "What model VI-LINK do you have?",
        "Why does it matter?",
        "Because a difference in model number is a difference in whether your brain melts or not.",
        "XA-3.",
        "Damn. Fancy for someone like you. Doing this to rebel against your rich daddy?"
    ],
    chrs.MAN, chrs.ARDA
)

const thedeal_collapse = createDialogueNode("Here's the deal. This isn't some tour, it's not even a safari.", chrs.MAN)

richDaddy.addCAROptionChild(
    "(Say Nothing)", "...",
    createDialogueNode('his smirk fades as quickly as it appeared', VISUALIZER)
).addChild(thedeal_collapse)

richDaddy.addCAROptionChild(
    "Back off", "None of your fucking business",
    "Like hell it isn't my business, I'm here to make sure you don't eject and dob immediately.",
    chrs.ARDA,
    chrs.MAN
).addMessageChain([
    'I got what I needed from that response though.',
    'Hold on to that angst kid, it will keep you going.'
]).addChild(thedeal_collapse)

const whenuslot_collapse = createDialogueNode("So... when you slot it, you're exposed. All of you. That clear?", chrs.MAN)

thedeal_collapse.addChild("I hand off the mod, then you're on your own.").addChild('Understand?')
    .addCAROptions([
        {
            summaryText: "Yes",
            fullText: "Yeah, of course.",
            response: createInlineDialogueTree(
                "Plus, I have your VLID, and you're the only client I've had in the past 3 weeks.",
                chrs.MAN,
                (r) => {
                    r.addChild("I'll know it's you if ASCM comes knocking on my door.")
                    .addChild("Want to remind you: My team works on homebrewed DVs daily, we can just as easily bypass an existing one.")
                    .addBackAndFourthChain([
                        "Are you done threatening me so we can get on with it?",
                        "I'm not threatening you, just some… terms and conditions.",
                        "Right, moving on."
                    ],
                        chrs.ARDA,
                        chrs.MAN
                    )
                        .addMessageChain([
                            { name: VISUALIZER, render: 'he smirks, though it is hard to tell if out of amusement or annoyance' },
                            { name: chrs.MAN, render: "Moving on… what you're getting isn't a patch or a plug-in, it's a permanent bypass. Burn once. Firmware update type of thing." },
                            "You know how it goes."
                        ])
                        .addChild(whenuslot_collapse)
                }
            )
        },
        {
            summaryText: "Questions First",
            fullText: "Can I ask some questions first?",
            response: createInlineDialogueTree(
                "If it's anything technical, no, I don't make the mods.", chrs.MAN,
                (r) => {
                    r.addChild('[General Questions To Clarify World Can Go Here', VISUALIZER)
                        .addChild("Alright enough questions, I have other things to do today.", chrs.MAN)
                        .addChild('he pauses', VISUALIZER)
                        .addChild("The only other warning I got for you is that this is a permanent bypass. Burn once.", chrs.MAN)
                        .addChild('Only way to get it to work.')
                        .addChild(whenuslot_collapse)
                }
            )
        }
    ]);


const cache_sealed_collapse = createDialogueNode(
    "The cache is sealed. Encrypted, obfuscated - whatever term makes you feel smart.",
    chrs.MAN
)

const nodocumentation_collapse = createDialogueNode('No documentation for a manual mode, at least anything public. This mod come with a guide?', chrs.ARDA);

whenuslot_collapse.addCAROptionChild(
    'Yes', 'Yes',
    "I would envy your confidence if I didn't know it will get you killed"
).addChild("Remember your DV will have to be manually controlled, don't get too comfortable")
.addChild(nodocumentation_collapse)

whenuslot_collapse.addCAROptionChild(
    'No', 'Not really',
    "Look, if you don't know what the hell the mod is doing I can't help you. I'm only giving you that disclaimer out of good conscience."
).addMessageChain([
    "I'm still selling, if you don't heed my warnings, it's your loss.",
    "...",
    "In any case, you'll have to prove your worth to some degree to get this mod working anyway."
])
.addChild('What does that mean?', chrs.ARDA)
.addChild(cache_sealed_collapse)

whenuslot_collapse.addCAROptionChild(
    '(Ask a technical question)',
    'Is it disabling my DV entirely? Sounds suicidal.',
    'he raises an eyebrown, slightly, a hint that you have said something outside of his usual script.',
    chrs.ARDA,
    VISUALIZER
).addMessageChain([
    {render: "No. Not entirely. We're not trying to kill you, even if you're paying us like you want to be killed.", name: chrs.MAN},
    {render: 'he shifts in his seat', name: VISUALIZER},
    {render: "It forces your DV into manual, old-school testing shit. The safety net's still there, but it's last effort stuff.", name: chrs.MAN},
    "Basic automation for fragments, and no coddling.",
    "You'll feel and see things almost as they are. Might not like how much of that is you.",
    {render: 'behind his sunglasses, the glint in his eye suggests he is speaking from experience', name: VISUALIZER},
    {render: "But hey - your F-CH hits critical, it'll still yank you. Just… no promises it'll be clean, or leave you whole.", name: chrs.MAN}
]).addChild(nodocumentation_collapse);


nodocumentation_collapse.addChild('he snorts', VISUALIZER)
    .addChild("A guide? Yeah. It's called 'dont die.'", chrs.MAN)
    .addChild("Being unable to craft their own sigils is why most people tap out before they even hit Fringe proper.")
    .addChild("Your DV won't autoresolve binds. You see something and you *deal* with it.")
    .addChild('His tone shifts', VISUALIZER)
    .addChild("Daemons don't exactly make sigils, but whatever they send at you will look pretty similar.", chrs.MAN)
    .addChild("Try to build something that counteracts it.")
    .addChild("Closest thing I got to a guide.")
    .addChild("Right. Any other protocol beside 'dont die?'", chrs.ARDA)
    .addChild("He exhales slowly, as if the question is an inconvenience", VISUALIZER)
    .addChild("Yeah, one more thing...", chrs.MAN)
    .addChild(cache_sealed_collapse);

const diskette_collapse = createDialogueNode("he slides a small diskette across the table", VISUALIZER);
diskette_collapse.attachSideEffect((ctx) => ctx?.actions?.cacheHandoverAnimation());

cache_sealed_collapse.addMessageChain([
    "The point is, we don't open it. Keeps the chain clean.",
    "You need to crack it yourself. That's part of the entry.",
    "You solve it: mod works. You don't: deadlock. Your fault.",
])
.addCAROptions([
    {
        summaryText: "No insurance?",
        fullText: "For the amount I paid, I would hope there'd be some insurance.",
        response: createInlineDialogueTree("He lets out a dry, mirthless chuckle", VISUALIZER, r => {
            r.addChild("Fringe net doesn't come with insurance now, does it?", chrs.MAN)
            .addChild("You're paying for a one way ticket. If it crashes, well, you're the one who landed it.")
            .addChild(diskette_collapse)
        })
    },
    {
        summaryText: "(Say nothing)",
        fullText: "...",
        response: "You'll figure it out, kid."
    }
])[1].addChild(diskette_collapse)

diskette_collapse.addChild("Enjoy your contraband.", chrs.MAN)
    .attachSideEffect((ctx) => ctx?.actions?.returnCamera())
    .addMessageChain([
        "When you're ready to go, meet us at the bridge mentioned on that cache, and give us a call.",
        "Don't message until then. They visit exactly once.",
        {render: "Before you can say anything more, the man abruptly rises out of his chair and departs", name: VISUALIZER}
    ])
    .attachSideEffect((ctx) => ctx?.actions?.departTheMan())

export default root;