import { onCleanup, onMount } from "solid-js";
import { Quaternion, Vector3, Euler, MathUtils } from 'three';

/**
 * Basic WADs controlled camera component with pitch and yaw movement, avoiding gimbal lock.
 */
export default function WadsCam({ speed = 5, rotationSpeed = 1 }: { speed?: number; rotationSpeed?: number }) {
    let camRef: any;

    // Convert degrees to radians
    const degToRad = MathUtils.degToRad;
    const radToDeg = MathUtils.radToDeg;

    // Handle keydown events for movement and rotation
    const handleKeyDown = (event: KeyboardEvent) => {
        if (!camRef) return;

        const { position, rotation } = camRef;

        // Handle movement
        switch (event.key) {
            case 'w': // Move forward (relative to yaw)
                const forward = new Vector3(0, 0, -1).applyQuaternion(getCameraQuaternion());
                position.add(forward.multiplyScalar(speed));
                break;
            case 's': // Move backward (relative to yaw)
                const backward = new Vector3(0, 0, 1).applyQuaternion(getCameraQuaternion());
                position.add(backward.multiplyScalar(speed));
                break;
            case 'a': // Move left (relative to yaw)
                const left = new Vector3(-1, 0, 0).applyQuaternion(getCameraQuaternion());
                position.add(left.multiplyScalar(speed));
                break;
            case 'd': // Move right (relative to yaw)
                const right = new Vector3(1, 0, 0).applyQuaternion(getCameraQuaternion());
                position.add(right.multiplyScalar(speed));
                break;
            case 'q': // Move up (global Y-axis)
                position.y -= speed;
                break;
            case 'e': // Move down (global Y-axis)
                position.y += speed;
                break;
            case 'ArrowUp': // Pitch up (look up)
                rotateCamera(0, -rotationSpeed);
                break;
            case 'ArrowDown': // Pitch down (look down)
                rotateCamera(0, rotationSpeed);
                break;
            case 'ArrowLeft': // Yaw left (look left)
                rotateCamera(-rotationSpeed, 0);
                break;
            case 'ArrowRight': // Yaw right (look right)
                rotateCamera(rotationSpeed, 0);
                break;
            default:
                break;
        }

        console.log('Camera Position:', position);
        console.log('Camera Rotation:', rotation);
    };

    // Get the camera's current quaternion
    const getCameraQuaternion = () => {
        const { rotation } = camRef;
        return new Quaternion().setFromEuler(
            new Euler(degToRad(rotation.x), degToRad(rotation.y), degToRad(rotation.z), 'YXZ')
        );
    };

    // Rotate the camera using quaternions to avoid gimbal lock
    const rotateCamera = (yawDelta: number, pitchDelta: number) => {
        if (!camRef) return;

        const { rotation } = camRef;

        // Convert current rotation to a quaternion
        const currentQuaternion = getCameraQuaternion();

        // Create quaternions for yaw and pitch deltas
        const yawQuaternion = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), degToRad(yawDelta));
        const pitchQuaternion = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), degToRad(pitchDelta));

        // Apply yaw first, then pitch
        const combinedQuaternion = currentQuaternion.multiply(yawQuaternion).multiply(pitchQuaternion);

        // Convert the resulting quaternion back to Euler angles
        const euler = new Euler().setFromQuaternion(combinedQuaternion, 'YXZ');

        // Update the camera's rotation property (in degrees)
        rotation.x = radToDeg(euler.x);
        rotation.y = radToDeg(euler.y);
        rotation.z = radToDeg(euler.z);
    };

    onMount(() => {
        window.addEventListener('keydown', handleKeyDown);
    });

    onCleanup(() => {
        window.removeEventListener('keydown', handleKeyDown);
    });

    return (
        <lume-perspective-camera
            align-point="0.5 0.5"
            id="SLOP"
            ref={camRef}
            active
        ></lume-perspective-camera>
    );
}