import './current-clash.css';
import { Sides } from "@/core/battle/utils/sides.utils";
import { MoveLexeme, MoveLexicon } from "../lexicon/moveLexicon";
import { Show } from 'solid-js';

export default function CurrentClash(props: {moves: Sides<MoveLexeme> | undefined, lexicons: Sides<MoveLexicon>}) {
    return (
    <Show when={props.moves !== undefined}>
        <div class="current-move-clash">
            <img src={props.lexicons.opponent[props.moves!.opponent].largeIcon}/>
            <p>|</p>
            <img src={props.lexicons.player[props.moves!.player].largeIcon} />
        </div>
    </Show>
    )
}