import { LumePosition } from "@/shared/types/3d.types";
import { AssetURL } from "@/shared/types/misc.types";
import { Plane, toDegrees, clamp } from "lume";
import { Vector2, Vector3 } from "three";
import { createEffect, on } from "solid-js";
import { InteractableComponent } from "../../core/interaction/interactable.types";
import { InteractableObject3D } from "../../core/interaction/interactable.types";
import { useInteractionContext } from "@/core/interaction/InteractionProvider";

interface BillboardProps extends InteractableComponent {
    texture: AssetURL,
    scale?: number,
    position: LumePosition
}

// Mask is generated at half resolution to reduce memory overhead.
const generateAlphaMask = (image: HTMLImageElement) => {
    const offscreenCanvas = document.createElement("canvas");
    const offscreenCtx = offscreenCanvas.getContext("2d", { willReadFrequently: true });
    const maskWidth = Math.max(1, Math.round(image.width / 2));
    const maskHeight = Math.max(1, Math.round(image.height / 2));
    offscreenCanvas.width = maskWidth;
    offscreenCanvas.height = maskHeight;
    offscreenCtx!.drawImage(image, 0, 0, maskWidth, maskHeight);
    const imgData = offscreenCtx!.getImageData(0, 0, maskWidth, maskHeight).data;

    const alphaMask = new Uint8Array(maskWidth * maskHeight);

    for (let i = 0; i < maskWidth * maskHeight; i++) {
        const alpha = imgData[i * 4 + 3];
        alphaMask[i] = alpha > 25 ? 1 : 0;
    }

    return { maskHeight, maskWidth, alphaMask }
}

/**
 * Yaw Only billboard as a LUME plane.
 * The billboard displays a texture (from input `texture` asseturl) at some `scale` (scale = width, height scaled automatically to retain aspect ratio), 
 * billboard handle interactions such as clicks and hovers or specific InteractionMode interactions.
 * 
 * Billboard is automatically alpha masked such that mouse events only fire on opaque parts of the texture.
 * @remark the sprite still consumes the raycast, meaning that interactions behind the texture plane will be blocked!
 *
 * @param props.texture - The URL of the texture to display on the billboard.
 * @param props.scale - An optional scaling factor for the billboard's size. Defaults to 1.
 * @param props.position - The position of the billboard in the 3D scene.
 * @param props.onClick - An optional callback triggered when the billboard is clicked. 
 *                         The callback receives the UV coordinates of the click.
 * @param props.onHover - An optional callback triggered when the billboard is hovered over. 
 *                        The callback receives the UV coordinates of the hover.
 * @param props.interactions - An optional map of interaction modes to callbacks. 
 *                              The callbacks are triggered based on the current interaction mode.
 *
 * @remarks
 * - The component uses an alpha mask automatically generated from the texture to determine the opaque regions.
 * - The billboard automatically adjusts its size based on the aspect ratio of the texture.
 * - The component ensures the billboard always faces the camera by computing its rotation dynamically.
 * - The `opacity` property is set to a very high value close to 1 to avoid rendering artifacts.
 *
 * @example
 * ```tsx
 * <Billboard
 *   texture="path/to/texture.png"
 *   scale={2}
 *   position={[0, 1, 0]}
 *   onClick={(uv) => console.log('Clicked at UV:', uv)}
 *   onHover={(uv) => console.log('Hovered at UV:', uv)}
 *   interactions={{
 *     chat: (uv) => DialogueService.startDialogue(...),
 *   }}
 * />
 * ```
 */
export default function Billboard(props: BillboardProps) {

    let me!: Plane
    let maskData = {
        alphaMask: null as Uint8Array | null,
        maskWidth: 0,
        maskHeight: 0
    }

    const { currentInteractionMode } = useInteractionContext();

    function isOpaque(uv: Vector2): boolean {
        if (!maskData.alphaMask) return true;
        const { alphaMask, maskWidth, maskHeight } = maskData;
        const x = clamp(Math.floor(uv.x * maskWidth), 0, maskWidth - 1);
        const y = clamp(Math.floor((1 - uv.y) * maskHeight), 0, maskHeight - 1);
        const index = y * maskWidth + x;
        return alphaMask[index] === 1;
    }

    createEffect(
        on(
            () => props.texture, // wrap props for Accessor signature.
            () => {
                console.log("texture change detetected");
                const img = new Image();
                img.src = me.texture!
                img.onload = () => {
                    const aspect = img.width / img.height;
                    me.size = `${(props.scale ?? 1) * aspect} ${(props.scale ?? 1)}`;
                    maskData = generateAlphaMask(img);
                }
            }
        )
    )

    createEffect(() => {
        if (props.onHover) {
            (me.three as InteractableObject3D).userData.onHover = (uv, mouse) => isOpaque(uv!) && props.onHover?.(uv, mouse)
        }

        (me.three as InteractableObject3D).userData.onClick = (uv, mouse) => {
            if (isOpaque(uv)) {
                props.onClick?.(uv, mouse);
                props.interactions?.[currentInteractionMode()]?.(uv, mouse);
            }
        }

        if (props.onHoverLeave) {
            (me.three as InteractableObject3D).userData.onHoverLeave = props.onHoverLeave;
        }

    })

    return (
        <lume-plane
            align-point="0.5 0.5"
            mount-point="0.5 0.5"
            texture={props.texture}
            position={props.position}
            ref={me}
            // Makes transparent parts of the image transparent while maintaining opacity of other pieces. 
            // Without this our billboard has black background.
            opacity="0.9999999999999999" // Weird artifacts when lower than this.

            cast-shadow="false"
            // enable all of these for a correct shadow.
            // cast-shadow
            // alpha-test={0.1}
            // sidedness="double"

            receive-shadow="false"
            has="basic-material"

            //@ts-expect-error - This is a valid property, just not in the typesfile.
            rotation={(x: number, y: number, z: number) => {
                const camera = me.scene?.camera
                const cameraWorldPos = new Vector3().setFromMatrixPosition(camera!.three.matrixWorld);
                const spriteWorldPos = new Vector3().setFromMatrixPosition(me.three.matrixWorld);

                const dx = cameraWorldPos.x - spriteWorldPos.x;
                const dz = cameraWorldPos.z - spriteWorldPos.z;
                const yaw = Math.atan2(dx, dz); // Compute angle from sprite to camera

                return [0, toDegrees(yaw), 0]
            }}
        />
    )
}
