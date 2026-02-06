import { createProgram, createTexture } from "../utils/webgl.utils";
import { AssetURL } from "../types/misc.types";

const SHADERPLANE_PASS_VERTEX_SHADER =
    `#version 300 es
    in vec2 position;
    out vec2 uv;

    void main() {
        uv = (position + 1.0) * 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

/**
 * Create a WebGL2 full-screen shader plane on a canvas and animate it.
 *
 * Summary:
 * - Initializes a WebGL2 context on the supplied canvas.
 * - Compiles and links the provided fragment shader with an internal full-screen vertex shader.
 * - Draws two triangles to cover the canvas and runs the fragment shader every frame.
 *
 * Parameters:
 * - canvasRef: HTMLCanvasElement — canvas that hosts the WebGL2 context. Must be attached to the DOM before calling. (e.g wrap this function inside Solid onMount)
 * - fragmentShader: string — GLSL ES 3.00 fragment shader source. The shader receives the provided uniforms and varying described below.
 * - textureImage?: AssetURL — optional image URL used to create a texture bound to texture unit 0.
 *
 * Uniforms provided to the fragment shader:
 * - float time — elapsed time in seconds (updated each frame).
 * - vec2 u_resolution — canvas pixel resolution (canvas.width, canvas.height). Note: set once at initialization; update manually on resize.
 * - sampler2D u_texture — available when textureImage is passed (bound to texture unit 0).
 *
 * Varyings:
 * - vec2 uv — UV coordinates across the full-screen plane in the range [0,1].
 *
 * Behavior & Notes:
 * - Requires WebGL2 (obtains context via 'webgl2'). Logs and returns early if unsupported.
 * - The vertex shader used is a simple pass-through that computes uv from position.
 * - Vertex buffer is static for two triangles (6 vertices).
 * - If a texture is provided, the texture is created asynchronously and rebound each frame before drawing.
 * - The animation uses requestAnimationFrame; `time` is supplied in seconds.
 * - If the canvas is resized, u_resolution will be stale unless updated explicitly.
 *
 * Errors/Throws:
 * - Throws if canvasRef is falsy or if program creation fails.
 *
 * Example (Solid onMount):
 * onMount(() => {
 *   createShaderPlane(canvasEl, fragmentShaderSource, some_texture_img);
 * });
 *
 * @param {HTMLCanvasElement} canvasRef
 * @param {string} fragmentShader
 * @param {AssetURL} [textureImage]
 * @returns {void}
 */
export default function createShaderPlane(canvasRef: HTMLCanvasElement, fragmentShader: string, textureImage?: AssetURL) {
    async function init() {
        if (!canvasRef) throw new Error("[createShaderPlane.ts]: Canvas undefined, unable to attach webgl context.");

        const gl = canvasRef.getContext('webgl2');
        if (!gl) {
            console.error("WebGL not supported.");
            return;
        }

        const program = createProgram(gl, SHADERPLANE_PASS_VERTEX_SHADER, fragmentShader);
        if (!program) throw new Error("[createShaderPlane.ts] Unable to create webgl program.");


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
        if (textureImage) {
            texture = await createTexture(gl, textureImage);
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
}