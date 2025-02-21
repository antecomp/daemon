import { ActionMessage } from "@/core/battle/engine/battle.types";
import { Accessor, For } from "solid-js";
import './action-messages.css'

interface ActionMessagesProps {
    messages: Accessor<ActionMessage[]>
}

export default function ActionMessages(props: ActionMessagesProps) {
    return (
        <div id="action-messages">
            <For each={props.messages()}>
                {message => <span class="action-message">{message.text}</span>}
            </For>
        </div>
    )
}