import { createEffect, createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import MessageBox from "./MessageBox";
import createTypewriter from "@/shared/hooks/createTypewriter";
import createHermesController, { HermesProps } from "./createHermesController";

import "./hermes.css";
import topb from "./assets/topb.png";
import midb from "./assets/midb.png";
import botb from "./assets/botb.png";
import ntwrk_gif from "./assets/ntwrk.gif";
import nameplateBorder from "./assets/nameplate_border.png";
import continuePanel from "./assets/continue_prompt.png"
import { MAIN_CHARACTER_VLID } from "@/config/init.config";

const OPTION_BACKGROUNDS = [topb, midb, botb];
const OPTIONS_PER_PAGE = OPTION_BACKGROUNDS.length;

/** Dialogue display used by `startDialogue`; for a temporary camera view, use `createDialogueWithCamOvr(...).start()`. */
export default function Hermes(props: HermesProps) {
    const { overlay, messages, options, pendingNext, advance } = createHermesController(props);
    const [optionsPage, setOptionsPage] = createSignal(0);
    const optionPages = createMemo(() =>
        Array.from({ length: Math.ceil(options().length / OPTIONS_PER_PAGE) }, (_, index) => index)
    );
    const visibleOptions = createMemo(() => {
        const offset = optionsPage() * OPTIONS_PER_PAGE;
        return options().slice(offset, offset + OPTIONS_PER_PAGE);
    });

    // Preview message for hovered option.
    const [hoveredOption, setHoveredOption] = createSignal("");
    const { displayText: optionPreviewText } = createTypewriter(hoveredOption);

    createEffect(() => {
        options();
        setOptionsPage(0);
        setHoveredOption('');
    });

    return (
        <>
            <Show when={overlay()}>
                <div
                    id='dialogue-overlay'
                    class='fademein'
                    style={{ background: `url(${overlay()})` }}
                />
            </Show>
            <div class='hermes-container'>
                <div class='messages-container'>
                    <div class='message-spacer-nightmare' />
                    <For each={messages()}>{(message) => <MessageBox {...message} />}</For>
                </div>
                <div class='sender-container'>
                    <div class='text-preview'>
                        <img src={nameplateBorder} />
                        <span class='name'>Arda</span>
                        {optionPreviewText()}
                    </div>

                    <Switch fallback={
                        OPTION_BACKGROUNDS.map((background, index) => {
                            const option = () => visibleOptions()[index];
                            return (
                                <div
                                    class="hermes-resp-container"
                                    classList={{ inactive: !option() }}
                                    onClick={() => option()?.select()}
                                    onMouseOver={() => {
                                        const hovered = option();
                                        if (hovered) setHoveredOption(hovered.full);
                                    }}
                                >
                                    <p>{option()?.summary}</p>
                                    <span />
                                    <img src={background} />
                                </div>
                            );
                        })
                    }>
                        <Match when={pendingNext()}>
                            <img
                                src={continuePanel}
                                class='hermes-next-prompt'
                                onClick={advance}
                            />
                        </Match>
                    </Switch>
                </div>

                <div class="hermes-footer">
                    <span>S-VLID:{MAIN_CHARACTER_VLID}</span>
                    <span>R-VLID:0000:0000</span>
                    <img src={ntwrk_gif} />
                </div>

                <Show when={optionPages().length > 1}>
                    <div classList={{
                        "hermes-pages": true,
                        "hp-first": optionsPage() === 0,
                        "hp-last": optionsPage() === optionPages().length - 1
                    }}>
                        <For each={optionPages()}>{(page) => (
                            <a
                                class="hermes-page-opt"
                                classList={{ "hpo-active": optionsPage() === page }}
                                onClick={() => setOptionsPage(page)}
                            />
                        )}</For>
                    </div>
                </Show>

            </div>
        </>
    )

}
