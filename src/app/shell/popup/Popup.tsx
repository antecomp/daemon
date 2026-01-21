import './popup.css'
import topbar_end from './assets/tb-end.png';
import topbar_label_end from './assets/tbl-end.png';
import topbar_label_head from './assets/tbl-head.png';
import bottom_header from './assets/bbe-header.png';
import bottom_end from './assets/bbe-end.png';
import { For, JSX, Match, ParentComponent, Switch } from 'solid-js';
import { nanoid } from 'nanoid';
import { popUILayer, pushUILayer } from '../layers/UILayerManager';

interface PopupProps {
    closeSelf: () => void
    title?: string,
    actions?: {
        prompt: string,
        dontClose?: boolean,
        action: () => void;
    }[]
}

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
                                {action => <p class="button" onClick={() => {action.action(); action.dontClose || props.closeSelf()}}>
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

/** TODO: DOCUMENT */
export default function spawnPopup(prompt: JSX.Element, actions?: PopupProps['actions'], title?: string) {
    const id = nanoid();

    pushUILayer({
        id,
        lock: 'all',
        blockBehind: true,
        style: {
            'display': 'grid',
            'place-items': 'center',
            'padding-bottom': '90px'
        },
        component: () => <Popup closeSelf={() => popUILayer(id)} actions={actions} title={title}>{prompt}</Popup>
    })    
}
