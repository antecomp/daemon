import './styles/current-clash.css';
import { Sides } from "@/core/battle/utils/sides.utils";
import { MoveLexeme, MoveLexicon } from "../lexicon/moveLexicon";
import { Show } from 'solid-js';
import { MoveTags } from '@/core/battle/model/move.types';

import apprentice_icon from '../assets/icons/runes/apprentice.png';
import mirror_icon from '../assets/icons/runes/mage.png';
import clash_arrow_img from '../assets/icons/clash_arrow.png';

import ct_b from '../assets/clash_thing_bot.png';
import ct_t from '../assets/clash_thing_top.png';

export default function CurrentClash(props: {moves: Sides<{moveName: MoveLexeme, tags: MoveTags | undefined}> | undefined, lexicons: Sides<MoveLexicon>}) {
    return (
    <Show when={props.moves !== undefined}>
        <div class="current-move-clash">
            <img src={ct_t} style={{'position': 'absolute', 'top': '-50px'}}/>
            <div class="opponent-side-of-clash">
                {/* Lazy and hard-coded, but good enough for now. */}
                <img src={props.lexicons.opponent[props.moves!.opponent.moveName].largeIcon}/>
                <div>
                    <Show when={props.moves?.opponent.tags?.includes('repeated')}>
                        <img src={apprentice_icon}/>
                    </Show>
                    <Show when={props.moves?.opponent.tags?.includes('mirrored')}>
                        <img src={mirror_icon}/>
                    </Show>
                </div>
            </div>
            <img src={clash_arrow_img} class="battle-clash-arrow"/>
            <div class="player-side-of-clash">
                <img src={props.lexicons.player[props.moves!.player.moveName].largeIcon} />
                <div>
                    <Show when={props.moves?.player.tags?.includes('repeated')}>
                        <img src={apprentice_icon}/>
                    </Show>
                    <Show when={props.moves?.player.tags?.includes('mirrored')}>
                        <img src={mirror_icon}/>
                    </Show>
                </div>
            </div>
            <img src={ct_b} style={{'position': 'absolute', 'bottom': '-50px'}}/>
        </div>
    </Show>
    )
}