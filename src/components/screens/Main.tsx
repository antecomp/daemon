import SceneContainer from "../SceneContainer";
import EventLog from "../ui/EventLog";
import InteractionModePicker from "../ui/InteractionModePicker";
import Sidebar from "../ui/Sidebar";
import '@/style/screens/Main.css'

/**
 * Main container UI/Screen for the majority of the game. It's the layout for our base scene navigation/interaction.
 */
export default function Main() {
    return (
        <div id="main">
            <Sidebar/>
            <SceneContainer/>
            <EventLog/>
            <InteractionModePicker/>
        </div>
    )
}