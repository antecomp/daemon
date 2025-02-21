import { ActionMessage } from "@/core/battle/engine/battle.types";
import { Accessor, For } from "solid-js";
import { TransitionGroup } from "solid-transition-group";
import './action-messages.css'

interface ActionMessagesProps {
    messages: Accessor<ActionMessage[]>
}

export default function ActionMessages(props: ActionMessagesProps) {
    return (
        <div id="action-messages">
            <TransitionGroup
                enterClass="fade-enter"
                enterActiveClass="fade-enter-active"
                exitClass="fade-exit"
                exitActiveClass="fade-exit-active"
            >
                <For each={props.messages()}>
                    {message => <span class="action-message">{message.text}</span>}
                </For>
            </TransitionGroup>
        </div>
    )
}