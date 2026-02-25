import './popup.css'
import topbar_end from './assets/tb-end.png';
import topbar_label_end from './assets/tbl-end.png';
import topbar_label_head from './assets/tbl-head.png';
import bottom_header from './assets/bbe-header.png';
import bottom_end from './assets/bbe-end.png';
import { For, JSX, Match, ParentComponent, Switch } from 'solid-js';
import { nanoid } from 'nanoid';
import { popUILayer, pushUILayer } from '../layers/UILayerManager';
import attachToConsole from '@/devtools/attachToConsole';
import { UILayer } from '../layers/ui-layers.types';

interface PopupProps {
    // Used to give popup ability to close own UILayer, passed by popup spawner.
    closeSelf: () => void
    title?: string,
    actions?: {
        prompt: string,
        dontClose?: boolean,
        action?: () => void;
    }[]
}

let activePopupCount = 0;

const Popup: ParentComponent<PopupProps> = (props) => {
    return (
        <div class="popup">
            <div class="topbar"><span /><img src={topbar_end} /></div>
            <div class="topbar-label">
                <img class="topbar-label-head" src={topbar_label_head} />
                <span>{props.title ?? 'NOTICE'}</span>
                <img src={topbar_label_end} />
            </div>
            <div class="popup-body">
                {props.children}
            </div>
            <div class="bottombar">
                <img src={bottom_header} />
                <span />
                <img src={bottom_end} />
                <div class="buttons">
                    <Switch fallback={<p class='button' onClick={props.closeSelf}><span>OK</span></p>}>
                        <Match when={props.actions && props.actions.length > 0}>
                            <For each={props.actions}>
                                {action => <p class="button" onClick={() => {action.action?.(); action.dontClose || props.closeSelf()}}>
                                    <span>{action.prompt}</span>
                                </p>}
                            </For>
                        </Match>
                    </Switch>
                </div>
            </div>
        </div>
    )
}

/**
 * Spawns a modal popup UI layer with custom content and optional action buttons.
 *
 * @param {JSX.Element} prompt - The content to display inside the popup body.
 * @param {Array<{prompt: string, dontClose?: boolean, action: () => void}>} [actions] - Optional array of button definitions.
 *        Each button has a label (`prompt`), an action callback, and an optional `dontClose` flag to keep the popup open after the action.
 * @param {string} [title] - Optional title to display in the popup header. Defaults to "NOTICE".
 * @param {boolean} [lock] - Optional - whether to activate a UI lock for this popup. Note these locks contain side effects such as closing sidebar windows!
 * @example
 * spawnPopup(<div>Hello!</div>, [
 *   { prompt: "OK", action: () => console.log("Confirmed") }
 * ], "Greeting");
 *
 * The popup is stacked visually when multiple are open, and only the topmost can be interacted with.
 * Closing a popup decrements the stack count.
 */
export default function createPopup(prompt: JSX.Element, actions?: PopupProps['actions'], title?: string, lock: UILayer['lock'] = 'scene') {
    const id = nanoid();
    const stackOffset = activePopupCount * 12;
    let closed = false;
    const closeSelf = () => {
        if (closed) return;
        closed = true;
        activePopupCount = Math.max(0, activePopupCount - 1);
        popUILayer(id);
    };

    pushUILayer({
        id,
        lock: lock,
        blockBehind: true,
        style: {
            'display': 'grid',
            'place-items': 'center',
            'padding-bottom': '90px',
            'transform': `translate(${stackOffset}px, ${stackOffset}px)`
        },
        component: () => <Popup closeSelf={closeSelf} actions={actions} title={title}>{prompt}</Popup>
    })
    activePopupCount += 1;
}

attachToConsole(() => createPopup("Test Popup"), "DG_TEST_POPUP");