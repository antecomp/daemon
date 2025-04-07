import CornerRect from "@/components/util/corner-rect/CornerRect";
import bl_scene from "../assets/bl_scene.png"
import br from "@/assets/ui/corners/da/br.png"
import tl from "@/assets/ui/corners/da/tl.png"
import tr from "@/assets/ui/corners/da/tr.png"

export default function SceneContainer() {
    return (
        <CornerRect
            borderSize={2}
            borderType="solid white"
            corners={[tl, tr, bl_scene, br]}
            id="scene-container"
        >
            <br />The Scene goes here
        </CornerRect>
    )
}