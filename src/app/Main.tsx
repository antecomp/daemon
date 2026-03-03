import Sidebar from "./shell/sidebar/Sidebar.tsx"
import SceneContainer from "./shell/scene-container/SceneContainer.tsx"
import IModePicker from "./shell/hud/IMode.tsx"
import EventLog from "./shell/hud/EventLog.tsx"

import './main.css'
import vl_badge from './assets/vl_badge.png'
import UILayerHost from "./shell/layers/UILayerHost"
import InteractionProvider from "@/core/interaction/InteractionProvider"
import { createSignal, Match, Switch } from "solid-js"
import { SKIP_NEW_GAME_LOGIN } from "@/config/init.config.ts"
import Login from "@/features/login/Login.tsx"
import { pushUILayer } from "./shell/layers/UILayerManager.ts"
import About from "@/features/about/About.tsx"

/* Warning that these IDs are used for createTooltips portal / rendered scale calculations!*/
export default function Main() {

    const [gameStart, setGameStart] = createSignal(SKIP_NEW_GAME_LOGIN);

    return (
        <main id="game-root">
            <Switch>
                <Match when={gameStart()}>
                    <InteractionProvider>
                        <Sidebar />
                        <SceneContainer />
                        <img class="vl-badge" src={vl_badge} onClick={() => {
                            const { popLayer } = pushUILayer({
                                component: () => <About closeSelf={() => popLayer()} />,
                                blockBehind: true,
                                classList: { centered: true }
                            })
                        }} />
                        <div id="bottom-bar">
                            <EventLog />
                            <IModePicker />
                        </div>
                        <UILayerHost />
                    </InteractionProvider>
                </Match>
                <Match when={!gameStart()}>
                    <Login setGameStart={setGameStart} />
                </Match>
            </Switch>
            {/* targeted by Portals for modals, tooltips, etc. Always top level.
                Doing it this way so whatever we spawn with Portals can inherit 
                positioning/scaling of game body. (whereas mounting to body may cause issues)
            */}
            <div id="modal-root" />
        </main>
    )
}