type Stage = 'RoundSetup' | 'BeforeMove' // | ... (come up with good convention later)

type StageReactionCTX<S extends Stage> = {
    /* TODO: somehow use S to dynamically change what the context is based on the templated stage type */
}

type StageReaction<S extends Stage> = (ctx: StageReactionCTX<S>) => void;

// TODO: I think this type may be incorrect and using the template wrong.
// trying to bind the Stage in the record to its corresponding reaction contexts.
type BattleStageReactionMap = Partial<Record<Stage, StageReaction<Stage>[]>>

// serially await each provided reaction handler...
// runReactions(stage, ctx, reactions);

// Eventually we will want to DI utilities such as RNG also...

// Decided on a function-based engine with the reaction map as an argument
// much easier to work with and clean up than a class (avoid new'ing and this'ing all the time.)
