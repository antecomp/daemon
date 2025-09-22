//@ts-nocheck

import { SEQUENCE_LENGTH } from "../battle/engine/battle.config";

class BattleEngine {
    constructor(player: PlayerBattleState, opponentData: DVOpponentData) {
        this.playerDoll = new Actor("Arda", PlayerBattleState.health);
        this.opponentData = opponentData
        this.opponentDoll = new Actor(opponent.name, );
    }
    // tracks internal state, provides methods for battle events that
    // update this state, return relevent information.
    // should never have a case where we "pull" out information 
    // or re-enter it for that matter, just ways to peak into the state of
    // the battle. Up to director to use this information.

    snapshot() {
        // return a massive state object that other ports
        // can utilize to do contextual changes.
    }
}

// animator, ui, expected to provide general methods for working with the UI
// only break of this rule is that createBattleDirector will spit
// out the setup/execute methods that we can attach to buttons
// or do whatever we want with them.

// could also easily have sensible defaults for ports, or have an overload
// to have a more dev-friendly createBattleDirector.

function createBattleDirector(ports) {

    // ports should have their own defaults ready.
    // for example ui should just have already its state to WAITING.
    // engine should be initialized elsewhere with the player and opponent stuff.
    const {animator, ui, engine, dev, audio } = ports;

    const setupRound = async () => {
        
        // await animator.opponentSequenceFadeOut();
        // MAKE IT THE UIS RESPONSIBILITY TO DO THE FADE WHEN IT CHANGES
        // WHY SHOULD THE DIRECTOR DO SOMETHING SO MENIAL?
        engine.prepareOpponentSequence() // saves some internal sequence state for the opponent this round;
        await ui.setInsight(engine.getOpponentHint()) // this hint can be generated from the previously set state
        dev?.log(engine.getOpponentSequence()) // can also easily have optional ports for debugging
    }

    const executeRound = async () => {

        ui.setState(EXECUTING);
        await ui.setInsight(engine.getOpponentHint);

        // have engine do the setMoveSequence(unwrapMoveMeta shit)
        // it can also do anything else we expect before sequence eval.
        // such as setting the sequence buffer.
        engine.prepare();

        for (let moveIndex = 0; moveIndex < SEQUENCE_LENGTH; moveIndex++) {
            // again - animateMoveHighlight could easily be done just by telling
            // ui what index we're on and it toggles a css class!
            // this way the ui can animate/regard this however it damn pleases.
            ui.setCurrentMoveIndex(moveIndex);

            // can set some internal currentMove for player/opponent
            // handles the old context building shit, tracked internally.
            // this can easily also call side effects attached on engine
            // init (remove need for "preRoundBehavior") shit,
            // instead just hook some method into engine.onPrepare.
            // this will also run the prepareMove stuff standard.
            engine.prepareMoves(moveIndex);

            // HELP: HOW THE HECK DO I HAVE NICE CROSS-COMMUNICATION/INTERWEAVE
            // OF ENGINE BEHAVIORS AND UI SIDE EFFECTS
            // SOMETIMES PREPAREMOVE MIGHT WANT TO APPEND AN ACTION MESSAGE
            // OR DO SOME INANE THING WITH THE UI!!!!!!

            // could even pull the ui.setCurrentIndex into this general visualize func maybe
            ui.visualize(engine.snapshot()); // visualize mults, statuses, whatever.

            // animator can handle the fallback of an arbitrary delay
            // when there's no animations / too short of animations.
            await animator.playMoveAnimations(engine.snapshot());

            // apply damage, update internal state.
            engine.commitMoves();

            // HOW DO I NICELY INTEGRATE DAMAGE FLASH?
            // PREVIOUSLY IT JUST WOULD FIRE AS A RESULT OF 
            // TAKING DAMAGE AND TALK TO ANIM DIRECTLY!!!

            ui.visualize(engine.snapshot()); // visualize changes in health

            if (engine.somebodyDead()) {
                handleDeath();
                return;
            }

            // no need for the post-context shit - engine already 
            // set up its internal context when we commited the moves.
            
            // bundle the post effect, status, and whatever else.
            engine.afterMoves(); 

            await animator.playAfterMoveAnimations(engine.snapshot())


            // I give up here, there are too many cases
            // where I want the systems to HOOK/RESPOND to changes
            // in engine, not explicitely time them
            // but I also need to make sure they dont over fire
            // or get untraceable and cause a huge mess and
            // AAAA I HATE THIS STUPID FUCKING COMPLEX BATTLE SHIT 
            // I WANT TO START ALL OVER BUT THAT DOESN'T
            // MAKE ME BETTER AN ENGINEERING IT!!!


        }
    }



}