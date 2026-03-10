import './styles/action-messages.css'

import { Accessor, createSignal, For } from "solid-js";
import { TransitionGroup } from "solid-transition-group";

import ai_plain_icon from '@/features/battle/assets/icons/battle-alerts/plain.png'
import ai_heal_icon from '@/features/battle/assets/icons/battle-alerts/heal.png'
import ai_focus_icon from '@/features/battle/assets/icons/battle-alerts/focus.png'
import ai_mania_icon from '@/features/battle/assets/icons/battle-alerts/mania.png'
import { NOTIFICATION_CLEAR_STAGGER, NOTIFICATION_LIFESPAN } from '../config/timings.config';

/** Mapping of a action message icon by name to it's AssetURL */
export const ACTION_MESSAGE_ICONS = {
    "default": ai_plain_icon,
    "heal": ai_heal_icon,
    "focus": ai_focus_icon,
    "mania": ai_mania_icon
}

/** Narrowed set of icon identifiers that can be referenced by action messages. */
type AvailableActionIcons = keyof typeof ACTION_MESSAGE_ICONS;

/** A single "Action Message" (battle notification). Has some text and can be decorated with an icon {@link AvailableActionIcons} */
export interface ActionMessage {
    iconName?: AvailableActionIcons
    text: string,
    id: number
}

/** Function signature for appending a new action message. Used as appendActionMessage is passed between many components. */
export type ActionMessageAppender = (text: string, iconName?: AvailableActionIcons) => void;

interface ActionMessagesProps {
    messages: Accessor<ActionMessage[]>
}

/** Component to actually render out the battle action messages. */
export default function ActionMessages(props: ActionMessagesProps) {
    return (
        <div class="action-messages">
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
                            <img src={(message.iconName && ACTION_MESSAGE_ICONS[message.iconName]) ?? ACTION_MESSAGE_ICONS.default} />
                        </div>
                    )}
                </For>
            </TransitionGroup>
        </div>
    )
}

export function createActionMessageStack() {
    let nextMessageId = 0;

    const [actionMessages, setActionMessages] = createSignal<ActionMessage[]>([]);
    const appendActionMessage: ActionMessageAppender = (text, iconName) => {
        const id = nextMessageId++;
        const currentLength = actionMessages().length;
        setActionMessages(prev => [...prev, {id, text, iconName}]);
        const removalDelay = NOTIFICATION_LIFESPAN + currentLength * NOTIFICATION_CLEAR_STAGGER;
        setTimeout(
            () => setActionMessages(prev => prev.filter(msg => msg.id !== id)),
            removalDelay
        );
    }

    return {actionMessages, appendActionMessage};
}