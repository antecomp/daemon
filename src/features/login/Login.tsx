import { Setter } from "solid-js";
import ASCM_LOGO from '@/assets/ui/misc/ASCM.png';
import { playTextOverlay } from "../text-overlay/TextOverlay";
import './login.css';
import { VERSION } from "@/config/init.config";

/* Fake login screen used for game init. */
export default function Login(props: { setGameStart: Setter<boolean> }) {
    return <div id="login-screen">
        <img src={ASCM_LOGO} />
        <h1>Welcome back, <span style={{color: 'yellow'}}>Arda</span></h1>
        <p>Please insert the <span style={{color: 'red'}}>VI-LINK</span> cable into your cerebral interface and press login.</p>
        <br />
        <button onClick={() => {props.setGameStart(true); playTextOverlay([["Cool Login Message!"]], true)}}>LOGIN</button>
        <footer>daemon.garden version {VERSION}, created by <a href="https://omni.vi">omni.vi</a></footer>
    </div>
}