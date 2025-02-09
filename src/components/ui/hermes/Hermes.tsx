import './hermes.css'
import { onMount } from "solid-js";
import dogtagFirst from './assets/dogtag_first.png'
import dogtagLast from './assets/dogtag_last.png'
import { createSignal, For } from "solid-js";
import { DialogueOption } from "@/core/dialogueNode";
import topb from './assets/topb.png'
import midb from './assets/midb.png'
import botb from './assets/botb.png'
import ntwrk from './assets/ntwrk.gif'
import nameplateBorder from './assets/nameplate_border.png'

interface MessageBoxProps {
    name: string,
    text: string | (() => string)
}

const MessageBox = (props: MessageBoxProps) => {
    let ref: HTMLDivElement | undefined;

    onMount(() => {
        ref && ref.scrollIntoView({behavior: 'smooth', block: 'center'})
    })

    return (
        <div id="message-body" ref={ref}>
            <div class="message-dogtag">
                <img src={dogtagFirst}/>
                <span>{props.name}</span>
                <img src={dogtagLast}/>
            </div>
            <div class="message-content">
                <p>{(typeof props.text === 'string') ? props.text : props.text()}</p>
            </div>
        </div>
    )
}

export default function Hermes() {

    const [messages, setMessages] = createSignal<MessageBoxProps[]>([
        {"name": "test", "text": "test message"},
        {"name": "test2", "text": "another test message"}
    ]);

    const [currentOptions, setCurrentOptions] = createSignal<DialogueOption[]>([]);
    const [currentOptionPage, setCurrentOptionPage] = createSignal(0);
    const optionsOffset = () => currentOptionPage() * 3;

return (
    <div class="hermes-container">
        <div class="messages-container">
            <div class="message-spacer-nightmare"></div>
            <For each={messages()}>
                {(message) => <MessageBox {...message}/>}
            </For>
        </div>
        <div class={`sender-container ${(currentOptions().length > 0) ? '' : 'inactive'}`}>
            <div class="text-preview">
                <img src={nameplateBorder} alt="" /> 
                <span class='name'>Eske</span> 
                Option previewed here!!
            </div>
            <div
                class={"hermes-resp-container " + ((currentOptions()[optionsOffset()]) ? '' : 'inactive')}
            >
                <p>{currentOptions()[optionsOffset()]?.summaryText ?? 'XXX'}</p>
                <span></span><img src={topb} alt="" />
            </div>
            <div
                class={"hermes-resp-container " + ((currentOptions()[1 + optionsOffset()]) ? '' : 'inactive')}
            >
                <p>{currentOptions()[optionsOffset()]?.summaryText ?? 'XXX'}</p>
                <span></span><img src={midb} alt="" />
            </div>
            <div
                class={"hermes-resp-container " + ((currentOptions()[2 + optionsOffset()]) ? '' : 'inactive')}
            >
                <p>{currentOptions()[optionsOffset()]?.summaryText ?? 'XXX'}</p>
                <span></span><img src={botb} alt="" />
            </div>
        </div>
        <div class='hermes-footer'>
            <img src={ntwrk}/>
            <span>S-VLID:91ae0:ffc13 R-VLID:0000:0000</span>
            <span class='hermes-disconnect'>DISCONNECT</span>
        </div>
        {/* TODO: Pagination Slop */}
    </div>
)
}