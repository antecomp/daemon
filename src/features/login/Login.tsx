import { Setter } from "solid-js";
import ASCM_LOGO from '@/assets/ui/misc/ASCM.png';


/* Fake login screen used for game init. */
export default function Login(props: { setGameStart: Setter<boolean> }) {
    return <div id="login-screen">
        <img src={ASCM_LOGO} />
        <p>Login Screen Here?</p>
        <button onClick={() => props.setGameStart(true)}>Login (New Game)</button>
    </div>
}