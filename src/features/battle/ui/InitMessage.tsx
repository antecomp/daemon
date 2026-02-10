import { createBattleRefAttacher } from "../animation/uiAnimations/battleUIRefRegistry"
import './styles/battle-init.css';
import left from '../assets/init_left.png';
import bottom from '../assets/init_message.png';
import right from '../assets/init_right.png';

export default function InitMessage(props: {message: string}) {

    const ref = createBattleRefAttacher('initMessage');

    return <div class="battle-init-message" ref={ref}>
        <img src={left} />
        <span>{props.message}</span>
        <img style={{'z-index': '20'}} src={right} />
        <img class="battle-init-bottom" src={bottom} />
    </div>
}