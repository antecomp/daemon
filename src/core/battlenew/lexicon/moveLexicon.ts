import { MoveLexicon } from "./lexicon.types"

// map planned moves by ID to their associated UI fallback data.
export const BASE_MOVE_LEXICON: MoveLexicon = {
    
}

// Reminder;
/* *
const merged = { ...a, ...b };
First, all properties from a are copied into the new object.

Then, all properties from b are copied in.

If b has the same property key as a, it overwrites the value from a.

Use this to have defaults (such as icons kept) for the moves, while shadowing other parts.
*/