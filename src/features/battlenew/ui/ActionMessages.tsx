import { Accessor, For } from "solid-js";
import { TransitionGroup } from "solid-transition-group";
import './action-messages.css'
import { ActionMessage } from "../bridge/actionMessages";
import { actionIcons } from "../bridge/actionMessages";

interface ActionMessagesProps {
    messages: Accessor<ActionMessage[]>
}

export default function ActionMessages(props: ActionMessagesProps) {
    return (
        <div id="action-messages">
            <TransitionGroup
                enterClass="fade-enter"
                enterToClass="fade-entered"
                exitClass="fade-exit"
                exitToClass="fade-exited"
            >
                <For each={props.messages()}>
                    {message => (
                        <div class="action-message">
                            <span>{message.text}</span>
                            <img src={(message.iconName && actionIcons[message.iconName]) ?? actionIcons.default} />
                        </div>
                    )}
                </For>
            </TransitionGroup>
        </div>
    )
}