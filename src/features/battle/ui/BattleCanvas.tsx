import { Point } from "@/shared/types/3d.types";
import { AssetURL } from "@/shared/types/misc.types";
import { createProgram, createTexture } from "@/shared/utils/webgl.utils";
import { onMount } from "solid-js";
import { createBattleRefAttacher } from "../animation/uiAnimations/battleUIRefRegistry";

import { SCENE_DIMENSIONS, SIDEBAR_WIDTH } from "@/config/ui.config";

const BATTLE_CANVAS_DIMENSIONS = {
    width: SCENE_DIMENSIONS.width + SIDEBAR_WIDTH,
    height: SCENE_DIMENSIONS.height
};

export default function BattleCanvas(props: {
    sprite: AssetURL,
    spriteOffset?: Point
    backgroundShader: string
    backgroundShaderTexture?: AssetURL
}) {

    let canvasRef!: HTMLCanvasElement;

    onMount(() => {
        async function init() {
            if (!canvasRef) throw new Error("[BattleCanvas]: Battle background canvas ref not loaded :(");

            const gl = canvasRef.getContext("webgl2");
            if (!gl) {
                console.error("WebGL not supported");
                return;
            }

            const vertexShaderSource =
                `#version 300 es
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

    const opponentSpriteRef = createBattleRefAttacher('opponentSprite');

    return (
        <>
            <canvas
                ref={(el) => {canvasRef = el}}
                id="battle-bg"
                {...BATTLE_CANVAS_DIMENSIONS}
            />
            <img
                ref={opponentSpriteRef}
                src={props.sprite}
                id="battle-sprite"
                style={{
                    translate: props.spriteOffset ? `${props.spriteOffset.x}px ${props.spriteOffset.y}px` : "none",
                }}
            />
        </>
    )
}