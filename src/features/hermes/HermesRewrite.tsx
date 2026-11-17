import { DialogueContext, DialogueOption } from "@/core/dialogue/dialogue.types";
import { BnyEmissionHandler, BnyOption, BnyPause, BnyPauseBody, BnyPauseHandler, BnyProgram, createVM } from "@bunnarray/vm";
import { createSignal, onMount } from "solid-js";
import { MessageBoxProps } from "./MessageBox";
import createTypewriter from "@/shared/hooks/createTypewriter";

export default function Hermes(
    // Destructure out of laziness. All of this should be static anyways.
    { program, ctx }: { program: BnyProgram, ctx: DialogueContext }
) {
    const [messages, setMessages] = createSignal<MessageBoxProps[]>([]);
    const addMessage = ({ name, text }: { name: string | null; text: string }) => setMessages((prev) => [...prev, { name, text }]);

    const [options, setOptions] = createSignal<DialogueOption[]>([]);
    const [optionsPage, setOptionsPage] = createSignal(0);
    const optionsOffset = () => optionsPage() * 3;
    const numPages = () => Math.ceil(options().length / 3);

    // Helper function to generate pagination for options (little thingy on the side.)
    const generatePages = () =>
        Array.from({ length: numPages() }, (_, i) => (
            <a
                class={`hermes-page-opt ${optionsPage() === i ? 'hpo-active' : ''}`}
                onClick={() => setOptionsPage(i)}
            ></a>
        ));

    // Preview message for hovered option.
    const [hoveredOption, setHoveredOption] = createSignal("");
    const { displayText: optionPreviewText } = createTypewriter(hoveredOption);

    function showOptions(opts: BnyOption[], select: (index: number) => void) {
        setOptionsPage(0);
        // parse and set options
        // any other needed logic here. select/attach logic can live here too.
    }

    const onEmission: BnyEmissionHandler = (emission) => {
        switch(emission.kind) {
            case 'say': {
                addMessage({name: emission.speaker, text: emission.text});
            }
        }
    }

    const onPause: BnyPauseHandler = (pause) => {

    }

    const vm = createVM(program, {
        memory: ctx.initialMemory,
        onEmission, onPause
    });

    onMount(vm.start);

}