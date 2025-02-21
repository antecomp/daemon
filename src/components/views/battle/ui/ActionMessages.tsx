import { ActionMessage } from "@/core/battle/engine/battle.types";
import { Accessor, For } from "solid-js";
import { TransitionGroup } from "solid-transition-group";
import './action-messages.css'
import placeholder_action_icon from "@/assets/icons/battle-alerts/blank.png"

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
                    {message => (
                        <div class="action-message">
                            <span>{message.text}</span>
                            <img src={placeholder_action_icon} alt="" />
                        </div>
                    )}
                </For>
            </TransitionGroup>
        </div>
    )
}