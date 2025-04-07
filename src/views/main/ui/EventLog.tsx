import CornerRect from "@/components/util/corner-rect/CornerRect";
import br from "@/assets/ui/corners/da/br.png"
import tr from "@/assets/ui/corners/da/tr.png"
import tl_el from "../assets/tl_el.png"

export default function EventLog() {
    return (
        <CornerRect
            borderSize={2}
            borderType="solid white"
            corners={[tl_el, tr, undefined, br]}
            id="event-log"
        >
            Event Log
        </CornerRect>
    )
}