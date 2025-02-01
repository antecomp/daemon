import { onMount, onCleanup, JSX, Ref, JSXElement } from 'solid-js';
import * as THREE from 'three';

/**
 * Simple WASD and mouse controlled camera for testing camera position and orientation within a scene.
 * 
 * Press spacebar to print the coordinates and orientation.
 * @param speed - movement speed for WASD
 * @param scene - ref to the containing scene for the camera
 * @returns 
 */
export default function WadsCam({ speed = 5}: { speed?: number}) {
  let bodyRef: any;
  let camRef: any;

  const moveSpeed = speed;
  const rotateSpeed = 0.05;

  let pitch = 0;  // X-axis rotation for the camera (up/down)
  let yaw = 0;    // Y-axis rotation for the body (left/right)

  // Handle mouse movement for yaw and pitch
  const handleMouseMove = (event: MouseEvent) => {
    if (!bodyRef || !camRef) return;

    yaw -= event.movementX * rotateSpeed;   // Yaw (rotate body left/right)
    pitch += event.movementY * rotateSpeed; // Pitch (tilt camera up/down)

    // Clamp pitch to prevent flipping
    pitch = Math.max(-90, Math.min(90, pitch));

    // Apply yaw to the body
    bodyRef.rotation.y = yaw;

    // Apply pitch to the camera
    camRef.rotation.x = pitch;
  };

  // Handle WASD movement relative to yaw
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!bodyRef) return;

    const direction = new THREE.Vector3();

    // Convert yaw to radians for trigonometric calculations
    const yawRad = THREE.MathUtils.degToRad(yaw);

    // Calculate forward and right vectors using sine and cosine
    const forward = new THREE.Vector3(Math.sin(yawRad), 0, Math.cos(yawRad));  // Inverted Z
    const right = new THREE.Vector3(Math.cos(yawRad), 0, -Math.sin(yawRad));  // Adjusted right vector

    switch (event.key) {
      case 'w':
        direction.sub(forward); // Move forwardssssssssssss
        break;
      case 's':
        direction.add(forward); // Move backward
        break;
      case 'a':
        direction.sub(right);   // Move left
        break;
      case 'd':
        direction.add(right);   // Move right
        break;
      case 'q':
        direction.y += 1;       // Move up (world space)
        break;
      case 'e':
        direction.y -= 1;       // Move down (world space)
        break;
        case ' ':
            console.log("x y z, - yaw - pitch - -");
            console.log(bodyRef.position.toString(), bodyRef.rotation.toString(), camRef.rotation.toString());
        break;
      default:
        break;
    }

    direction.normalize().multiplyScalar(moveSpeed);

    // Apply movement to the body position
    bodyRef.position.x += direction.x;
    bodyRef.position.y += direction.y;
    bodyRef.position.z += direction.z;
  };

  // Attach event listeners
  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    if(bodyRef.parentElement) {
        bodyRef.parentElement.addEventListener("click", () => bodyRef.parentElement.requestPointerLock());
    }
  });

  // Cleanup event listeners
  onCleanup(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('keydown', handleKeyDown);
    if(bodyRef.parentElement) {
        bodyRef.parentElement.removeEventListener("click", () => bodyRef.parentElement.requestPointerLock());
    }
  });

  // Render the body and camera
  return (
    <lume-element3d ref={bodyRef} 
    id="test"
    position="0 -192 5"
    align-point="0.5 0.5"
    >
      <lume-perspective-camera ref={camRef} active />
    </lume-element3d>
  );
}
