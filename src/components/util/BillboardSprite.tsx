import { Element3D } from "lume";
import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import * as THREE from 'three'

interface BillboardSpriteProps {
    texture: string // (img url)
    size?: number
    position: `${number} ${number} ${number}`
}

export default function BillboardSprite(props: BillboardSpriteProps) {
    let wrapperRef: Element3D | undefined;

  
    function waitForScene(callback: () => void) {
        if (wrapperRef?.scene?.three) {
          callback();
        } else {
          console.log("Scene isn't ready yet, waiting...");
          requestAnimationFrame(() => waitForScene(callback)); // Retry until scene exists
        }
      }
    
      function loadTexture(callback: (texture: THREE.Texture) => void) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
          props.texture,
          (texture) => callback(texture),
          undefined,
          (error) => console.error("Texture loading error:", error)
        );
      }
    
      function createSprite(texture: THREE.Texture) {
        if (!wrapperRef?.three) {
          console.error("Scene was ready but somehow disappeared?");
          return;
        }
    
        const baseSize = props.size || 100;
        const aspect = texture.image.width / texture.image.height;
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(aspect * baseSize, baseSize, 1);
        wrapperRef.scene?.needsUpdate();
    
        wrapperRef.three.add(sprite);
    
        onCleanup(() => {
          console.log("Cleaning up sprite");
          wrapperRef?.three.remove(sprite);
          spriteMaterial.dispose();
          texture.dispose();
        });
      }
    
      onMount(() => {
        waitForScene(() => {
          loadTexture((texture) => createSprite(texture));
        });
      });


    return (
        <lume-element3d
            id="spritea"
            align-point="0.5 0.5"
            ref={wrapperRef}
            position={props.position}
        />
    )
}