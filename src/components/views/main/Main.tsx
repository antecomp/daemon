import SceneContainer from "@/components/ui/scene-container/SceneContainer";
import EventLog from "@/components/ui/event-log/EventLog";
import InteractionModePicker from "../../ui/interaction/InteractionModePicker";
import Sidebar from "@/components/ui/sidebar/Sidebar";
import './Main.css'
import Hermes from "@/components/ui/hermes/Hermes";

/**
 * Main container UI/Screen for the majority of the game. It's the layout for our base scene navigation/interaction.
 */
export default function Main() {
    return (
        <>
        <div id="main">
            <Sidebar/>
            <SceneContainer/>
            <EventLog/>
            <InteractionModePicker/>

            <Hermes/>
        </div>
        </>
    )
}