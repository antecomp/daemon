import { onMount, type Element3D, type PerspectiveCamera, type Scene } from "lume";

export default function createCamera() {
    let camRef!: PerspectiveCamera;
    let bodyRef!: Element3D;
    let scene: Scene;

    return {
        Camera: () => {
            onMount(() => {
                scene = camRef.scene!;
                console.log(scene);
            });

            return (
                <lume-element3d id="cam_body" align-point="0.5 0.5" ref={bodyRef}>
                    <lume-perspective-camera id="cam_head" active ref={camRef}
                        far="9999" // for dev purposes, see everything. Remove for prod.
                    />
                </lume-element3d>
            )
        }
    }
}