import { startBattle } from "@/core/battle/battleManager";
import sidebar_button_placeholder from "../assets/sidebar_button.png";
import { OPPONENT_PANOPTES } from "@/data/battles/panoptes";

export default function Sidebar() {
    return (
        <div id="sidebar">
            <img src={sidebar_button_placeholder} alt="" class="sidebar-button"
                onClick={() => startBattle(OPPONENT_PANOPTES)}
            />
            <img src={sidebar_button_placeholder} alt="" class="sidebar-button" />
            <img src={sidebar_button_placeholder} alt="" class="sidebar-button" />
        </div>
    )
}