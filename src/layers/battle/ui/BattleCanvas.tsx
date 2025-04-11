import { createProgram } from "@/utils/webgl.utils"
import { onMount } from "solid-js"
import OverlayAnimator from "./OverlayAnimator"
import { registerBattleUIRef } from "./refRegistry"
import { AssetURL, Point } from "@/extra.types"
import { loadImage } from "@/utils/loadImage"
import { SCENE_DIMENSIONS } from "@/config"

interface BattleCanvasProps {
  sprite: AssetURL
  spriteOffset?: Point
  backgroundShader: string
  backgroundShaderTexture?: AssetURL
}

async function createTexture(gl: WebGL2RenderingContext, url: AssetURL): Promise<WebGLTexture> {
  const img = await loadImage(url);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // Flip image to match u,v coords.
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.generateMipmap(gl.TEXTURE_2D);

  return texture!;
}

export default function BattleCanvas(props: BattleCanvasProps) {
  let canvasRef: HTMLCanvasElement | undefined

  let spriteRef: HTMLImageElement | undefined

  onMount(() => {
    async function init() {
      if (!canvasRef) throw new Error("[BattleCanvas]: Battle background canvas ref not loaded :(");
  
      registerBattleUIRef('opponentSprite', spriteRef);
  
      const gl = canvasRef.getContext("webgl2");
      if (!gl) {
        console.error("WebGL not supported");
        return;
      }
  
      // Vertex Shader (Static, since we just draw a fullscreen quad)
      const vertexShaderSource = `#version 300 es
        in vec2 position;
        out vec2 uv;
        void main() {
          uv = (position + 1.0) * 0.5;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;
  
      const program = createProgram(gl, vertexShaderSource, props.backgroundShader);
      if (!program) return;
  
      const vertices = new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1
      ]);
  
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  
      gl.useProgram(program);
  
      const timeUniform = gl.getUniformLocation(program, "time");
      const u_texture = gl.getUniformLocation(program, "u_texture");
      const u_resolution = gl.getUniformLocation(program, "u_resolution");
      gl.uniform2f(u_resolution, canvasRef.width, canvasRef.height);
  
      // Wait for texture (if any)
      let texture: WebGLTexture | null = null;
      if (props.backgroundShaderTexture) {
        texture = await createTexture(gl, props.backgroundShaderTexture);
        gl.uniform1i(u_texture, 0); // Set texture unit index
      }
  
      let startTime = performance.now();
  
      function render() {
        if (!gl) return;
  
        const currentTime = (performance.now() - startTime) / 1000.0;
        gl.uniform1f(timeUniform, currentTime);
  
        // Texture needs to be rebound each frame.
        if (texture) {
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, texture);
        }
  
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
      }
  
      render();
    }
  
    init();
  });  

  console.log(props);


  return (
    <>
      <canvas id="battle-bg" width="985" height={SCENE_DIMENSIONS.height + 26} 
        ref={(el) => {canvasRef = el}}
      >
      </canvas>
      <img 
        src={props.sprite} 
        id="battle-sprite" 
        ref={spriteRef} 
        style={{
          translate: props.spriteOffset ? `${props.spriteOffset.x}px ${props.spriteOffset.y}px` : "none",
        }}
      />
      <OverlayAnimator />
    </>
  )
}