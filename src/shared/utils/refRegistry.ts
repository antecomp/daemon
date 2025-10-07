
export type Registry<K extends readonly string[]> = {
    [Key in K[number]]?: HTMLElement;
};

export type RegistryAttacher<K extends readonly string[]> = (val: K[number], ref: HTMLElement) => void;


export function createRefRegistry<const K extends readonly string[]>() {

    const refRegistry: Registry<K> = {};

    const attachToRegistry: RegistryAttacher<K> = (val, ref) => {
        refRegistry[val] = ref;
    };

    return { attachToRegistry, refRegistry };
}


//type Anticipated = ["egg", "slop", "stew"];

//const { attachToRegistry, refRegistry } = createRefRegistry<Anticipated>();

// Example usage:
//attachToRegistry('egg', document.createElement('div'));