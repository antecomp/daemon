import { Element3D, ObjModel } from "lume";


/** Recursively enables shadows (including self-shadowing) on all subcomponents of model. Can be used to add shadows to a map component. */
export default function applyShadows(ref: Element3D | ObjModel) {

    // Cursed but functional alternative (keepin just in case).
    // if(ref.three.children.length == 0) {
    //     console.error("Unable to apply shadows, (object isn't loaded yet?)", "trying again in 100ms");
    //     setTimeout(() => {
    //         applyShadows(ref);
    //     }, 100);
    // } else {
    //     ref.three.traverse(n => {
    //         //@ts-ignore // (property does exist but it's not typed in)
    //         if(!n.isMesh) return;
    //         n.castShadow = true;
    //         n.receiveShadow = true;
    //     });
    // }

    /* WARNING: THIS EVENT LISTENER SYSTEM WILL BE DEPRECATED AND REPLACED IN LATER
    VERSIONS OF LUME. WORKS FOR NOW.  */
    ref.on('MODEL_LOAD', (_m: any) => {
        ref.three.traverse(n => {
            //@ts-ignore // (property does exist but it's not typed in)
            if(!n.isMesh) return;
            n.castShadow = true;
            n.receiveShadow = true;
        });
    })

}