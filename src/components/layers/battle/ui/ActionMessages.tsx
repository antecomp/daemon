import { ActionMessage } from "@/core/battle/engine/battle.types";
import { Accessor, For } from "solid-js";
import { TransitionGroup } from "solid-transition-group";
import './action-messages.css'
import { actionIcons } from "@/core/battle/engine/battle.config";

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
                            <img src={message.icon ? actionIcons[message.icon] : actionIcons.default} alt="" />
                        </div>
                    )}
                </For>
            </TransitionGroup>
        </div>
    )
}