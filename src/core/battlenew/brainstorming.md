Battle engine is the SSOT for all battle state, it contains the Actors, their sequences, and any transient round data (such as all the old context stuff in the old engine, it tracks the multipliers, move index, all of that).
Currently, we hard code and await all side effects for the battle (e.g the animations). This is the key "grossness" of battle.logic.ts. It manages too many responsibilities, and it is too direct in what it should be doing.
Instead, let's have the engine contain a map of hook collections for each point where we may want to pause the logic and wait for updates (ui changes, animations, sound effects, etc.): preExec, beforeMove, damageCommit, postEffect, roundCleanup... whatever.
Each of these is just a collection of async callbacks that we set when we instantiate the engine. After the engine completes logic for a stage of battle, itll just await all of the junk in the associated collection. Because the callbacks run sequentially and can await, they’re natural homes for blocking work such as animations or sound cues. But the battle logic never needs to know what those are.
All of these hooks will receive a rich context object (fancy for saying a reference to the engine itself, including all of it's current state). This means that every hook can make proper decisions about their actions based on the current state. A UI bundle can register its hooks to play health bar animations, a testing bundle can register assertions, animation bundles can play animations for the current move, and so on... None of these are truly "in" the battle loop, they register on their own, and are just handed state. We can easily mix, match, omit and modify the behaviors that occur at each stage of battle. For example, tests can omit all animation hooks, and instead insert assertion hooks. 

A BattleEngine that has an array of async "hook" callbacks, associated with different stages of battle evaluation (e.g after calculating the move outcome we pause and wait for hooks associated with that stage, such as animations). Where these hooks can be dynamically switched out based on how we're using the battle engine, the main game will insert callbacks for animations, whereas unit tests won't insert animations but may insert callbacks to assert battle status. This means the battle logic can still be interweaved with blocking events such as animations, sound effects, and UI updates, but the battle logic has no concern as to what those events are, just that it needs to call and wait for them at certain stages of evaluation. In other words, these "hooks" are called almost like reactions to "breakpoints" that we add in the game logic. Eventually I would like to do that, but am overwhelmed with trying to recreate other parts of the battle logic. I would like other aspects to remain relatively the same, but reduced where needed (f.e the actor should no longer have that weird onDamageTaken observer pattern for sound effects!). I still want to start over and build everything back up, as this will let me redesign the interfaces/systems to be minimal, instead of having residual crap from jamming in features. The hooks should be last, after the logic works purely on its own. As this allows me to make a solid foundational logic block, and then add "breakpoints" to it's eval that can hand off the current state. This way I know exactly when I should/can add these points for the UI/Animations, without engineering the logic around said breakpoints.

---

GENERAL RULE: CTX SHOULD NEVER PROVIDE CALLBACKS FOR ANYTHING, ONLY LOGICAL CONTEXT
IT IS UP TO EVAL STAGES TO EMIT CURRENT GAME STATE TO HOOKS ARR FOR RUNNING SIDE EFFECTS.

Actor should be persistent combat state only
- Health, Statuses. That's literally it.
- Sequences should be on their own,as part of transient round eval. Not as data we randomly throw into actor.

planRound(): oppMeta
    - Get Meta Sequence From AI
    - Signal hooks (ui would use this to display hint)

resolveRound(playerMeta, oppMeta)
    - Unwrap player and opponent Metas. Return (or set) those.

executeRound(player, opp, player_seq, opp_seq)
    -> calls evaluateStep in a loop. Broken so we can perform just a single interaction chain

REMOVE SEQUENCE BUFFER. INSTEAD EACH STAGE OF A MOVE CAN ALSO OUTPUT AN "OUTCOME" THAT IS
PASSED AS PART OF THE CONTEXT TO THE NEXT MOVE.
Have each step also spit out an outcome that becomes part of the context for later things. In fact, pulling things out into an outcome means we dont need to worry about double messaging, because we can instead just have a messager hook (later) capture that outcome in the current logical context, and use that to print the message once (since its just getting the context at that point, not being fired as a side effect of the pipeline reducer). The context provided to the mult pipeline, or post effects can be based on the outcomes saved from the previous battle stages. For example, Evades pipeline step could emit a outcome of success, which becomes part of the context for it's post step, allowing the post step to easily, and functionally, determine whether to apply Mania or not. This eliminates the scratch buffer, and makes the communication between steps explicitely unidirectional. How does that sound?
* Every step (per side, per index) accumulates a StepOutcome alongside the math.
* Pre/mult/post phases can read from and add to the outcome; they don’t emit messages or touch UI.
* The engine returns events that include the outcomes; a later “messaging” hook reads them once and decides what to show.
type StepOutcome = { flags: { evade?: boolean; focusLost?: boolean; } } <- Can we make this less gross?
* Outcome simply added to multipler pipeline reducer, preEffects, etc.
* Then it's incorporated into the CTX we pass betweene evaluation stages.

We will almost certainly use a class for bundling the logical stuff together, plan, resolve, and executeRound/Turn. As a class will let us switch out the hooks later, and the general dependencies of how the system works. Question is if this class should just have a functional bits (take in actors, sequences, whatever) and spit out result information. Or if this class should initialize some actors and internal state, then run to modify it's own status continually.
* ~~Although it kinda adds more overhead/complexity, I think a blend of pure, functional core logic that are then called and crafted together by some orchestrator (alongside the breakpoints) may still be ideal. Instead of just shoving the hook-"breakpoints" in the middle of a bigass imperative mutating evalRound method.~~ <- this could becomes especially noisey, memory intensive, and hard to understand the flow of if we make EVERYTHING pure functions. We'd be passing around new actor clones everywhere instead of just modifying their internal state with very easy-to-understand takeDamage/addStatus, whatever, simple data structures with a clear change. At the same time, that makes the snapshots for hook reactions extremely safe and reliable, and easy to test, as it truly is a snapshot at each stage. I am conflicted.

Mix idea. Pure functions then we "apply" the results mutably <- is this any better than pure function handoff?????? Seems like the same amount of boilerplate. Only thing is this means the pure functions only need to absorb & send info relevent to their execution.
* Per step i:
    * pre = computePre(i, player, opponent, moves, rng) // pure; includes StepOutcome flags
    * await hooks.preMove({ i, pre }) // no mutation
    * damage = computeDamage(pre) // pure numbers
    * applyDamage(damage, { player, opponent }) // mutates actors
    * await hooks.afterDamage({ i, damage, actorsSnapshot })
    * post = computePost(i, player, opponent, pre, damage) // pure; statuses/effects to apply, flags
    * applyPost(post, { player, opponent }) // mutates actors (statuses, heals, etc.)
    * tickStatuses({ player, opponent }) // mutates actors
    * await hooks.postMove({ i, post, actorsSnapshot })
    * if (isDead({ player, opponent })) { await hooks.battleEnd(...); break }