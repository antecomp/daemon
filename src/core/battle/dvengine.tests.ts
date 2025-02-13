import { Actor } from "./actor";
import { evaluatePairing } from "./dvengine";
import { Attack, Fireball, Defend, Observe, Evade, Prepare, Heal } from "./moves";

const allMoves = [Attack, Fireball, Defend, Observe, Evade, Prepare, Heal];

// Create test actors
const player = new Actor("Player", 100, allMoves);
const enemy = new Actor("Enemy", 100, allMoves);

// Function to print current state of actors
function printActorState(actor: Actor) {
    console.log(`${actor.name}: HP=${actor.health}`);
    console.log(`With Effects:`, JSON.stringify([...actor.effects.entries()], null, 2));
}



// Iterate through all possible move pairings
for (const playerMove of allMoves) {
    for (const enemyMove of allMoves) {
        console.log("========================================");
        console.log(`TESTING: Player uses ${playerMove.name} vs Enemy uses ${enemyMove.name}`);
        console.log("========================================");
        
        player.currentSequence[0] = playerMove;
        enemy.currentSequence[0] = enemyMove;

        // Reset actor health before each test
        player.health = 100;
        enemy.health = 100;
        player.effects = new Map();
        enemy.effects = new Map();

        console.log("BEFORE MOVE:");
        printActorState(player);
        printActorState(enemy);

        // Run the move pairing
        evaluatePairing(0, player, enemy);
        
        console.log("AFTER MOVE:");
        printActorState(player);
        printActorState(enemy);
        console.log("\n\n");
    }
}