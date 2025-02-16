import { createProgram } from "@/util/webgl.utils"
import { createEffect } from "solid-js"

interface BattleCanvasProps {
    sprite: string // image url
    fragmentShader: string
}

export default function BattleCanvas(props: BattleCanvasProps) {
    let canvasRef: HTMLCanvasElement | undefined

    createEffect(() => {
        if (!canvasRef) return;

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

        const program = createProgram(gl, vertexShaderSource, props.fragmentShader);
        if (!program) return;
    
        // Full-screen quad
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
    
        let startTime = performance.now();

        function render() {

            if(!gl) return;

          let currentTime = (performance.now() - startTime) / 1000.0;
          gl.uniform1f(timeUniform, currentTime);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
          requestAnimationFrame(render);
        }
    
        render();

    })


    return (
        <>
            <canvas id="battle-bg" width="1060" height="695" ref={canvasRef}></canvas>
            <img src={props.sprite} alt="" id="battle-sprite" />
        </>
    )
}