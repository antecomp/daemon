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

    onMount(() => {
        if (!wrapperRef) return;
    
        const textureLoader = new THREE.TextureLoader();
        const baseSize = props.size || 100;
    
        textureLoader.load(
          props.texture,
          (texture) => {
            if (!wrapperRef.scene?.three) {
                console.log("Scene isnt fucking loaded yet kms");
              requestAnimationFrame(() => {
                if (wrapperRef.scene) createSprite(texture);
              });
            } else {
              createSprite(texture);
            }
          },
          undefined,
          (error) => console.error("Texture loading error:", error)
    );
    
    function createSprite(texture: THREE.Texture) {
          const aspect = texture.image.width / texture.image.height;
          const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
          const sprite = new THREE.Sprite(spriteMaterial);
          sprite.scale.set(aspect * baseSize, baseSize, 1);
    
          wrapperRef?.three.add(sprite);
    
          onCleanup(() => {
            wrapperRef?.three.remove(sprite);
            spriteMaterial.dispose();
            texture.dispose();
          });
        }
    });



    return (
        <lume-element3d
            id="sprite"
            align-point="0.5 0.5"
            ref={wrapperRef}
            position={props.position}
        />
    )
}