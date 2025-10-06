

type Registry<K extends readonly string[]> = { [Key in K[number]]?: HTMLElement };

function createRefRegistry<const K extends readonly string[]>() {
    
    const refRegistry: Registry<K> = {};

    function attachToRegistry(val: K[number], ref: HTMLElement) {
        refRegistry[val] = ref;
    }

    return { attachToRegistry, refRegistry };
}

type Anticipated = ["egg", "slop", "stew"];

const { attachToRegistry, refRegistry } = createRefRegistry<Anticipated>();

// Example usage:
attachToRegistry('egg', document.createElement('div'));