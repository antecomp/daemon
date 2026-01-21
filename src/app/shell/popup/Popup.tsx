import './popup.css'
import topbar_end from './assets/tb-end.png';
import topbar_label_end from './assets/tbl-end.png';
import topbar_label_head from './assets/tbl-head.png';
import bottom_header from './assets/bbe-header.png';
import bottom_end from './assets/bbe-end.png';
import btn_left_first from './assets/b-left-first.png';
import { ParentComponent } from 'solid-js';

const Popup: ParentComponent = (props) => {
    return (
        <div class="popup">
            <div class="topbar"><span /><img src={topbar_end} /></div>
            <div class="topbar-label">
                <img class="topbar-label-head" src={topbar_label_head} />
                <span>NOTICE</span>
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
                    <p class="button">
                        <img src={btn_left_first} />
                        <span>Button 1</span>
                    </p>
                    <p class="button">
                        <span>Button 2</span>
                    </p>
                    <p class="button">
                        <span>Button 3</span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Popup;