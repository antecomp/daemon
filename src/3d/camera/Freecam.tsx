import { Orientation } from "@/shared/types/3d.types";
import { XYZ } from "@/shared/types/3d.types";
import { clamp, Scene } from "lume";
import {createSignal, onCleanup, onMount} from 'solid-js'
import PlayerCam from "./PlayerCam";

interface FreecamProps {
    sceneRef: Scene
    rotationSpeed?: number,
    movementSpeed?: number,
    initialPos?: XYZ,
    initialOri?: Orientation
}

const DEFAULT_ROT_SPEED = 50;
const MAX_ROT = 90;
const DEFAULT_MOVEMENT_SPEED = 3;


/**
 * Freecam component provides a free-flying camera controller for 3D scenes.
 * 
 * Allows the user to move and rotate the camera using keyboard controls:
 * - Movement: W/A/S/D (forward/left/back/right), Q/Space (down), E/V (up)
 * - Rotation: I/K (pitch up/down), J/L (yaw left/right)
 * - Sprint: Hold Shift to increase movement and rotation speed
 * - Export: Press P to copy the current camera transform as a PlayerCam snippet to the clipboard
 * 
 * The camera's position and orientation are managed with reactive signals sent to PlayerCam (thus all features of PlayerCam are also enabled, you can test interactions.)
 * 
 * @param props - FreecamProps object
 * @param props.movementSpeed - Optional base movement speed (default: `DEFAULT_MOVEMENT_SPEED`)
 * @param props.rotationSpeed - Optional base rotation speed (default: `DEFAULT_ROT_SPEED`)
 * @param props.sceneRef - Reference to the 3D scene (passed to PlayerCam)
 */
export default function Freecam(props: FreecamProps) {
    const [basePos, setBasePos] = createSignal<XYZ>(props.initialPos ?? [0, 0, 0]);
    const [baseOri, setBaseOri] = createSignal<Orientation>(props.initialOri ?? { yaw: 0, pitch: 0 });

    // Hold keypress state with a simple set
    const keysdown = new Set<string>();
    function keydown(e: KeyboardEvent) { keysdown.add(e.key.toLowerCase()) }
    function keyup(e: KeyboardEvent) { keysdown.delete(e.key.toLowerCase()) }

    let rafID = 0;
    let last = performance.now();

    function step() {
        const now = performance.now();
        const dtSec = (now - last) / 1000;
        last = now;

        // Current target value
        const [x, y, z] = basePos();
        const { yaw, pitch } = baseOri();

        let moveSpeed = props.movementSpeed ?? DEFAULT_MOVEMENT_SPEED;
        let rotSpeed = props.rotationSpeed ?? DEFAULT_ROT_SPEED;
        if (keysdown.has("shift")) { // "sprint"
            moveSpeed *= 5;
            rotSpeed *= 2;
        }


        let newYaw = yaw;
        let newPitch = pitch;
        if (keysdown.has("j")) newYaw += rotSpeed * dtSec;
        if (keysdown.has("l")) newYaw -= rotSpeed * dtSec;
        if (keysdown.has("i")) newPitch -= rotSpeed * dtSec;
        if (keysdown.has("k")) newPitch += rotSpeed * dtSec;

        // clamp pitch.
        newPitch = clamp(newPitch, -MAX_ROT, MAX_ROT);

        const yawRad = (newYaw * Math.PI) / 180;
        const forwardX = Math.sin(yawRad);
        const forwardZ = Math.cos(yawRad);
        const rightX = Math.cos(yawRad);
        const rightZ = -Math.sin(yawRad);

        let dx = 0, dy = 0, dz = 0;
        if (keysdown.has("w")) { dx -= forwardX * moveSpeed; dz -= forwardZ * moveSpeed; }
        if (keysdown.has("s")) { dx += forwardX * moveSpeed; dz += forwardZ * moveSpeed; }
        if (keysdown.has("a")) { dx -= rightX * moveSpeed; dz -= rightZ * moveSpeed; }
        if (keysdown.has("d")) { dx += rightX * moveSpeed; dz += rightZ * moveSpeed; }
        if (keysdown.has("e") || keysdown.has("v")) { dy += moveSpeed; }
        if (keysdown.has("q") || keysdown.has(" ")) { dy -= moveSpeed; }

        if (dx || dy || dz) setBasePos([x + dx, y + dy, z + dz]);
        if (newYaw !== yaw || newPitch !== pitch) setBaseOri({ yaw: newYaw, pitch: newPitch });

        rafID = requestAnimationFrame(step);

        if(keysdown.has("p")) {
            exportTransform();
        }
    }

    // Export preconfigured PlayerCam component to clipboard to paste right in :)
    function exportTransform() {
        const pos = basePos();
        const ori = baseOri();
        const config = {
            basePos: [Math.round(pos[0]), Math.round(pos[1]), Math.round(pos[2])] as XYZ,
            baseOri: { yaw: Math.round(ori.yaw), pitch: Math.round(ori.pitch) } as Orientation,
        };

        const snippet =
            `<PlayerCam
                basePos={[${config.basePos.join(", ")}]}
                baseOri={{ yaw: ${config.baseOri.yaw}, pitch: ${config.baseOri.pitch} }}
                maxYaw={30}
                maxPitch={20}
                animate={false}
                sceneRef={sceneRef!}
            />`;

        // clipboard + console
        const payload = snippet;
        navigator.clipboard?.writeText(payload).catch(() => {/* ignore */ });
        // eslint-disable-next-line no-console
        console.log("[Freecam export]", config, "\n\nSnippet:\n", snippet);
    }

      onMount(() => {
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    last = performance.now();
    rafID = requestAnimationFrame(step);
  });

    onCleanup(() => {
    cancelAnimationFrame(rafID);
    window.removeEventListener("keydown", keydown);
    window.removeEventListener("keyup", keyup);
  });

  return (
    <PlayerCam
        basePos={basePos()}
        baseOri={baseOri()}
        maxYaw={10}
        maxPitch={10}
        animate
        sceneRef={props.sceneRef}
    />
  )
}