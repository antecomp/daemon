import { Actor } from "../actor";
import { evaluateSequencePairing } from "../archive/dvengine";
import { PreparedEffect, VulnerableEffect } from "../effects";
import { Attack, Fireball, Defend, Observe, Evade, Prepare, Heal, StrongAttack, NothingMove } from "../moves";

import { describe, expect, test } from 'vitest'

// Verify tester works
// test('adds 1 + 2 to equal 3', () => {
//     expect(1 + 2).toBe(3)
// })

// Helper function to create fresh test actors
function createActors() {
    return {
        player: new Actor("Player", 100),
        enemy: new Actor("Enemy", 100),
    };
}

describe("Basic Move Functionality", () => {
    test("Basic Attack Damage Calculation", () => {
        const { player, enemy } = createActors();
        player.currentSequence = [Attack, Attack, Attack, Attack, Attack];
        enemy.currentSequence = [Attack, Attack, Attack, Attack, Attack];

        evaluateSequencePairing(player, enemy);

        expect([player.health, enemy.health]).toEqual([95, 95]);
    });

    test("Refuse to evaluate incorrect sequence length", () => {
        const { player, enemy } = createActors();
        //@ts-ignore
        player.currentSequence = [Attack]; // Only 1 move
        expect(() => evaluateSequencePairing(player, enemy)).toThrow("Player sequence not of correct length to evaluate");
    });
});

describe("Move Interactions", () => {
    test("Heal should be cancelled if attacked", () => {
        const { player, enemy } = createActors();
        player.currentSequence = [Heal, Heal, Heal, Heal, Heal];
        enemy.currentSequence = [Attack, Attack, Attack, Attack, Attack];

        evaluateSequencePairing(player, enemy);
        expect(player.health).toBe(90); // Heal should not have occurred + Vulnerable Damage
    });

    test("Heal should work when not attacked", () => {
        const { player, enemy } = createActors();
        player.currentSequence = [Heal, Heal, Heal, Heal, Heal];
        enemy.currentSequence = [Defend, Defend, Defend, Defend, Defend];

        evaluateSequencePairing(player, enemy);
        expect(player.health).toEqual(100); // Heal should succeed
    });
});

describe("Effect Stacking & Status Checks", () => {
    test("Vulnerable should double incoming damage", () => {
        const { player, enemy } = createActors();
        player.addEffect(new VulnerableEffect(5));
        player.currentSequence = [Defend, Defend, Defend, Defend, Defend];
        enemy.currentSequence = [Attack, Attack, Attack, Attack, Attack];

        evaluateSequencePairing(player, enemy);

        expect(player.health).toEqual(95); // Should take increased damage
    });

    test("Stacked Vulnerability should increase damage further", () => {
        const { player, enemy } = createActors();
        player.addEffect(new VulnerableEffect(5));
        player.addEffect(new VulnerableEffect(5)); // Double vulnerability
        player.currentSequence = [NothingMove, NothingMove, NothingMove, NothingMove, NothingMove];
        enemy.currentSequence = [Attack, Attack, Attack, Attack, Attack];

        evaluateSequencePairing(player, enemy);

        expect(player.health).toEqual(80); // Should take massively increased damage
    });

    test("Prepared should increase outgoing damage", () => {
        const { player, enemy } = createActors();
        player.addEffect(new PreparedEffect(5));
        player.currentSequence = [Attack, Attack, Attack, Attack, Attack];
        enemy.currentSequence = [Defend, Defend, Defend, Defend, Defend];

        evaluateSequencePairing(player, enemy);
        expect(enemy.health).toEqual(95); // Should deal extra damage
    });
});

describe("Sequence Processing", () => {
    test("Ensure full 5-turn sequence processes correctly", () => {
        const { player, enemy } = createActors();
        player.currentSequence = [Attack, Fireball, Prepare, StrongAttack, Heal];
        enemy.currentSequence = [Defend, Evade, Attack, Observe, Attack];

        evaluateSequencePairing(player, enemy);

        expect(player.health).toBeLessThan(100);
        expect(enemy.health).toBeLessThan(100);
    });

    test("Evade should allow dodge chance", () => {
        const { player, enemy } = createActors();
        player.currentSequence = [Evade, Evade, Evade, Evade, Evade];
        enemy.currentSequence = [Attack, Attack, Attack, Attack, Attack];

        evaluateSequencePairing(player, enemy);
        expect(player.health).toBeGreaterThan(80); // Should have dodged some attacks
    });
});

describe("Vulnerability Stacking As Move Results", () => {
    test("Ensure Observed Then Attack on VulnMove Applies and deals 2x vulnerability", () => {
        const {player, enemy} = createActors();

        player.currentSequence = [Observe, Attack, NothingMove, NothingMove, NothingMove];
        enemy.currentSequence = [NothingMove, Prepare, NothingMove, NothingMove, NothingMove];

        evaluateSequencePairing(player, enemy);

        expect(enemy.health).toEqual(96);
    })

    test("Temporary Vuln On VulnMove", () => {
        const {player, enemy} = createActors();

        player.currentSequence = [Attack, Attack, NothingMove, NothingMove, NothingMove];
        enemy.currentSequence = [Prepare, NothingMove, NothingMove, NothingMove, NothingMove];

        evaluateSequencePairing(player, enemy);

        // Should be 2x damage from on prepare, then just 1 damage
        expect(enemy.health).toEqual(97);
        
    })
})

describe("Effect Carryover Between Sequences", () => {
    test("Vulnerable Carryover", () => {
        const {player, enemy} = createActors();

        player.currentSequence = [NothingMove, NothingMove, NothingMove, NothingMove, Observe];
        enemy.currentSequence = [NothingMove, NothingMove, NothingMove, NothingMove, Observe];

        evaluateSequencePairing(player, enemy);

        expect(player.effects.has("vulnerable")).toBe(true);
        expect(enemy.effects.has("vulnerable")).toBe(true);
    })

    test("Vulnerable Carryover Stacking", () => {
        const {player, enemy} = createActors();

        player.currentSequence = [NothingMove, NothingMove, NothingMove, NothingMove, Observe];
        enemy.currentSequence = [NothingMove, NothingMove, NothingMove, NothingMove, NothingMove];

        evaluateSequencePairing(player, enemy);

        player.currentSequence = [Attack, NothingMove, NothingMove, NothingMove, NothingMove];
        enemy.currentSequence = [Prepare, NothingMove, NothingMove, NothingMove, NothingMove];

        evaluateSequencePairing(player, enemy);

        expect(enemy.health).toEqual(96);
    })
})