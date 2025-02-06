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
    let sprite: THREE.Sprite | null = null;
    let spriteMaterial: THREE.SpriteMaterial | null = null;
  
    onMount(() => {
      if (!wrapperRef) return;
  
      const textureLoader = new THREE.TextureLoader();
      const baseSize = props.size || 100;
  
      textureLoader.load(
        props.texture,
        (texture) => {
          if (!wrapperRef.scene?.three) {
            console.error("Scene is missing at texture load time.");
            return;
          }
  
          const aspect = texture.image.width / texture.image.height;
          spriteMaterial = new THREE.SpriteMaterial({ map: texture });
          sprite = new THREE.Sprite(spriteMaterial);
          sprite.scale.set(aspect * baseSize, baseSize, 1);
  
          wrapperRef.three.add(sprite);
          // EXTREMELT IMPORTANT BELOW. NEED TO TELL SCENE TO ACTUALLY RE-RENDER
          // OUR SPRITE IN!!!!!!!!!!!!!!!!!!!!!!!!
          wrapperRef.scene.needsUpdate();
        },
        undefined,
        (error) => console.error("Texture loading error:", error)
      );
  
      onCleanup(() => {
        if (sprite && wrapperRef) {
          wrapperRef.three.remove(sprite);
        }
        spriteMaterial?.dispose();
        sprite?.material.map?.dispose();
        sprite = null;
        spriteMaterial = null;
      });
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