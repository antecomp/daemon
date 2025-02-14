import { Actor } from "./actor";
import { MultiplierSet } from "./battle.types";
import { printActorState } from "./dvengine.tests";
import { computeEffectMultipliers } from "./effects";

export function evaluatePairing(index: number, player: Actor, enemy: Actor) {
    const playerMove = player.currentSequence[index];
    const enemyMove = enemy.currentSequence[index];

    //console.log(`Processing Move Pairing: ${playerMove} vs ${enemyMove}`);

    playerMove.applyPreEffect(player, enemy);
    enemyMove.applyPreEffect(enemy, player);

    playerMove.applyCounterEffect(player, enemy, enemyMove);
    enemyMove.applyCounterEffect(enemy, player, playerMove);

    console.log("INTERMEDIATE STATE:")
    //printActorState(player);
    //printActorState(enemy);

    const playerEffectMultipliers = computeEffectMultipliers(player);
    const enemyEffectMultipliers = computeEffectMultipliers(enemy);

    const playerMoveMultipliers = playerMove.getMultipliers(player);
    const enemyMoveMultipliers = enemyMove.getMultipliers(enemy);

    const playerFinalMultipliers: MultiplierSet = {
        incoming: playerEffectMultipliers.incoming * playerMoveMultipliers.incoming,
        outgoing: playerEffectMultipliers.outgoing * playerMoveMultipliers.outgoing
    }

    const enemyFinalMultipliers: MultiplierSet = {
        incoming: enemyEffectMultipliers.incoming * enemyMoveMultipliers.incoming,
        outgoing: enemyEffectMultipliers.outgoing * enemyMoveMultipliers.outgoing
    }

    enemy.takeDamage(playerFinalMultipliers.outgoing * enemyFinalMultipliers.incoming);
    player.takeDamage(enemyFinalMultipliers.outgoing * playerFinalMultipliers.incoming);

    
    player.tickAndRemoveEffects();
    enemy.tickAndRemoveEffects();

    // Apply PostEffects AFTER ticking down (so duration 1 actually makes sense.)
    playerMove.applyPostEffect(player, enemy);
    enemyMove.applyPostEffect(enemy, player);

    for (const effectStack of player.effects.values()) {
        effectStack.forEach(effect => effect.applyPostEffect(player, enemy));
    }

    for(const effectStack of enemy.effects.values()) {
        effectStack.forEach(effect => effect.applyPostEffect(enemy, player));
    }
}

export function evaluateSequencePairing(player: Actor, enemy: Actor) {
    if(player.currentSequence.length != 5) throw new Error("Player sequence not of correct length to evaluate");
    if(enemy.currentSequence.length != 5 ) throw new Error("Enemty sequence not of correct length to evaluate")
    
    for(let i = 0; i < 5; i++) {
        evaluatePairing(i, player, enemy);
    }

    // I think resetting the sequence should be done elsewhere.
}