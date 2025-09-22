//@ts-nocheck

import { snapshot } from "node:test"
import { SEQUENCE_LENGTH } from "../../battle/engine/battle.config"
import { MoveMeta } from "../../battle/moves/moves.types"

interface BEYield_PreExec {
    stage: 'pre_exec'
    snapshot: {
        opponentSequence: MoveMeta[]
        // player, opp health and statuses
        // only information we have access to at this point
    }
}

interface BEYield_OtherStage {
    stage: 'other_stage'
    snapshot: {
        // other stuff we have access to at this point
    }
}

// In general make the stage data compounding, what we have access to
// instead of arbitrarily limiting at each stage
// makes it easier to add more reactivity later.

// make generator yield time a union of all the above interfaces.
// switching generator.stage should give us access to only the available
// properties within each switch case

// Generator<Yield, Return, Next>
function* battleEngine(playerData, opponentData) {

    // create opponent/player Actors here.

    // difficult thing is action messages, 
    // snapshot should have a buffer/stream of messages
    // when we yield, spit out those messages into snapshot and clear buffer.

    while(!death) {
        // setup round
        //generate opponent sequence

        // yield provides opponent sequence - up to UI in driver to show hint
        // we anticiapte that the .next call here will provide the player sequence (execute round)
        // maybe even make revealing the whole sequence on player input a responsibility of UI
        // not of the engine, reduces the need for another yield point.
        const playerInput = yield({stage: 'pre_exec', snapshot: {/* opp seq */}});
        if (!playerInput) throw new Error("Battle Engine Failure : Received No Player Sequence For Eval");

        // unwrap, configure sequence data here (187:197 in battle.logic.ts)

        // This one is likely uneeded
        yield({stage: 'before_round', snapshot: {/* opp sequence */}});
        
        // difficult thing is opponentData.preRoundBehavior and postRound behavior...
        // especially since it self-modifies the opponent.
        
        // Eval Sequence "round"
        for(let moveIndex = 0; moveIndex < SEQUENCE_LENGTH; moveIndex++) {
            // prepare moves - setting up the multipliers, preEffects
            // move animations in director would play after this yield...
            yield({stage: "before_move", snapshot: {/* moves & move index, multipliers, new statuses/health */}});
            
            // commit damage
            yield({stage: "damage_commit", snapshot: {/* same as above + damage dealt, new healths */}});

            if(checkForDeath()) return; // early exit if someone died from damage commit

            // configure immediate post effects
            yield({stage: "imm_post_effects", snapshot: {/* ... */}});

            // resolve statuses

            // may be unneeded.
            yield({stage: "post_effects", snapshot: {/* ... */}});

            // ui can use this one to reset anything it needs
            // but it shouldn't be necessary
            // more useful for unit testing to see the outcome of a single exchange.
            yield({stage: "move_end", snapshot: {/* ... */}});
        }
    }

    // Death:
    return {/* info needed to handle death */}; 
}


async function battleDirector(playerData: PlayerInit, opponentData: OppInit) {
  const engine = battleEngine(playerData, opponentData);
  let step = engine.next(); // Prime the iterator

  while (true) {
    const { value, done } = step;
    if (done) {
      await handleBattleEnd(value); // play death anims, resolve promise, etc.
      return value;
    }

    // Consider pulling this switch out into some sort
    // of map of stage -> subscribers (array of functions).
    switch (value.stage) {
      case 'pre_exec': {
        // for this stage we actually need to pass data into the next
        // (player sequence.)
        ui.showOpponentHint(value.snapshot.opponentSequence)
        const playerSequence = await ui.collectPlayerSequence();
        step = engine.next({ playerSequence });
        break;
      }

      case 'before_move': {
        await animator.playMoveAnimations(value.snapshot)
        step = engine.next();
        break;
      }

      case 'damage_commit': {
        await ui.updateStatusBars(value.snapshot);
        step = engine.next();
        break;
      }

      case 'imm_post_effects': {
        // whatever attachments...
        step = engine.next();
        break;
      }

      case 'post_effects': {
        // whatever attachments...
        step = engine.next();
        break;
      }

      case 'move_end': {
        ui.clearMoves(); // or whatever.
        step = engine.next();
        break;
      }
    }
  }
}