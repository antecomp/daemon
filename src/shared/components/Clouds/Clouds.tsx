import { LumePosition } from "@/shared/types/3d.types";
import { Motor, onMount, Plane } from "lume";
import pass_vert from '@/3d/shaders/post-processing/pass.vert.glsl';
import cloud_frag from './clouds.glsl';

const DEFAULT_TIME_SCALE = 0.0001;

export default function Clouds(props: { size: LumePosition, position: LumePosition, timeScale?: number }) {
    let cloudPlane!: Plane;

    onMount(() => {
        (cloudPlane as any).vertexShader = pass_vert;
        (cloudPlane as any).fragmentShader = cloud_frag;

        Motor.addRenderTask(t => {
            const mat = cloudPlane.behaviors.get('shader-material');
            if (!mat) return;
            mat.uniforms.time.value = t * (props.timeScale ?? DEFAULT_TIME_SCALE);
            cloudPlane.needsUpdate();
        });
    })

    return (
        <lume-plane
            ref={cloudPlane}
            receive-shadow="false"
            //@ts-expect-error
            has="shader-material" // attaches vertexShader and fragmentShader properties to mesh that we can modify.
            align-point="0.5 0.5"
            mount-point="0.5 0.5"
            size={props.size}
            uniforms='{
                "time": { "value": 1.0 }
            }'
            opacity={0.5}
            rotation='90 0 90'
            position={props.position}
            sidedness="double"
        />
    )
}