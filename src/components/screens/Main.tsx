import SceneContainer from "../SceneContainer";
import EventLog from "../ui/EventLog";
import InteractionModePicker from "../ui/InteractionModePicker";
import Sidebar from "../ui/Sidebar";
import '@/style/screens/Main.css'

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



/*

Need to have
"Content" (or better name if you can think of one) - this is the main screen.
    It needs to be able to support 'tabbing' without completely disconnecting the other (i.e we need overlays without killing scene)
    Or you can make it less robust and just have a "Content" and "Overlay" item that disables content temporarily.
        Could I juse use "display: hidden" to swap it out visually in the DOM without unloading?

    Bottombar
    Sidebar
    Both of these need to have an "active" or not property (likely managed by Main to keep things easy)

*/