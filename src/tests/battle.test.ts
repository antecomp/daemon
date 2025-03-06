import { describe, it, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { useBattleLogic } from "@/core/battle/engine/battle.logic";
import { Actor } from "@/core/battle/engine/actor";
import { Status } from "@/core/battle/engine/statuses";
import { DVOpponentData, MultiplierSet } from "@/core/battle/engine/battle.types";
import { MoveMeta, PlayerMoveMeta } from "@/core/battle/moves/moves.types";
import { NothingMove } from "@/core/battle/moves/moves.list";
import { BattleUIState } from "@/core/battle/engine/battle.context";
import { playerMoves } from "@/core/battle/moves/metas/player";
// Basic Hooks to Verify We Can Test Hooks at All.
function useCounter(initialValue = 0) {
    const [count, setCount] = createSignal(initialValue);
    
    function increment() {
      setCount(count() + 1);
    }
  
    function decrement() {
      setCount(count() - 1);
    }
  
    return { count, increment, decrement };
}
describe("useCounter hook", () => {
    it("should initialize with the given value", () => {
      createRoot(() => {
        const { count } = useCounter(10);
        expect(count()).toBe(10);
      });
    });
  
    it("should increment the count", () => {
      createRoot(() => {
        const { count, increment } = useCounter(5);
        increment();
        expect(count()).toBe(6);
      });
    });
  
    it("should decrement the count", () => {
      createRoot(() => {
        const { count, decrement } = useCounter(3);
        decrement();
        expect(count()).toBe(2);
      });
    });
});

describe("Actor Basics", () => {
  it("Should initialize actor", () => {
    const basicActor = new Actor("Test", 50);
    expect(basicActor.name).toBe("Test");
    expect(basicActor.health).toBe(50);
  });

  it("should take damage on takeDamage, should heal on heal", () => {
    const basicActor = new Actor("Test", 50);
    basicActor.takeDamage(10);
    expect(basicActor.health).toBe(40);
    basicActor.heal(10);
    expect(basicActor.health).toBe(50);
  })

  it("should cap damage and healing respectively", () => {
    const basicActor = new Actor("Test", 10);
    basicActor.takeDamage(1000);
    expect(basicActor.health).toBe(0);
    basicActor.heal(10000);
    expect(basicActor.health).toBe(10);
  })
})

describe("Actor Status System", () => {

  const nothingStatus = class extends Status{
    constructor(duration: number = 1) {
      super("xxx", duration);
    }

    getStatusMultipliers(_level: number): MultiplierSet {
      return {incoming: 1, outgoing: 1};
    }
  };

  it("Can add statuses", () => {
    const basicActor = new Actor("Test", 10);
    basicActor.addStatus(new nothingStatus(1));
    expect(basicActor.statuses.has("xxx")).toBe(true);
    expect(basicActor.getStatusLevel("xxx")).toBe(1);
  })

  it("Properly returns 0 for level of nonapplied statuses", () => {
    const basicActor = new Actor("Test", 10);
    expect(basicActor.getStatusLevel("bogus")).toBe(0);
  })

  it("Statuses stack", () => {
    const basicActor = new Actor("Test", 10);
    basicActor.addStatus(new nothingStatus(1));
    basicActor.addStatus(new nothingStatus(1));
    basicActor.addStatus(new nothingStatus(1));
    expect(basicActor.getStatusLevel("xxx")).toBe(3);
  })

  it("Statuses tick down and clear", () => {
    const basicActor = new Actor("Test", 10);
    basicActor.addStatus(new nothingStatus(2));
    basicActor.tickAndRemoveStatuses();
    expect(basicActor.statuses.get("xxx")?.[0].duration).toBe(1);
    basicActor.tickAndRemoveStatuses();
    expect(basicActor.statuses.has("xxx")).toBe(false);
  });

  it("Level changes with status tickdown", () => {
    const basicActor = new Actor("Test", 10);
    basicActor.addStatus(new nothingStatus(2));
    basicActor.addStatus(new nothingStatus(1));
    expect(basicActor.getStatusLevel("xxx")).toBe(2);
    basicActor.tickAndRemoveStatuses();
    expect(basicActor.getStatusLevel("xxx")).toBe(1);
  })

  it("Status tick up basic", () => {
    const basicActor = new Actor("Test", 10);
    basicActor.addStatus(new nothingStatus(2));
    basicActor.tickUpStatus("xxx", 1);
    expect(basicActor.statuses.get("xxx")?.[0].duration).toBe(3);
  });

  it("Multi-level status tickup", () => {
    const basicActor = new Actor("Test", 10);
    basicActor.addStatus(new nothingStatus(2));
    basicActor.addStatus(new nothingStatus(1));
    basicActor.tickUpStatus("xxx", 1);
    // Test may fail based on setter sorting, try swapping the indices around.
    expect(basicActor.statuses.get("xxx")?.[0].duration).toBe(2);
    expect(basicActor.statuses.get("xxx")?.[1].duration).toBe(3);
  });
});

/////////////////////

const nothingMove: PlayerMoveMeta = {
  displayName: "Idle",
  icon: "",
  getMove: NothingMove,
  rbIcon: "",
  description: ""
};

function generateSampleOpponent(seq?: MoveMeta[]) {
  const DVO: DVOpponentData = {
    name: "Automata",
    icon: "",
    sprite: "",
    maxHealth: 100,
    // Override this per-test.
    getSequence: (_me, _player) => seq ?? [nothingMove, nothingMove, nothingMove, nothingMove, nothingMove],
    backgroundShader: ``
  }
  return DVO;
}

describe("useBattleLogic Hook Init", () => {
  it("setupRound test", () => {
    const {setupRound, battleUIState, insight} = useBattleLogic(generateSampleOpponent());
    setupRound();
    expect(battleUIState()).toBe(BattleUIState.WAITING);
    expect(insight().length).toBe(5);
  });

  it("Exec runs and ends", async () => {
    const {setupRound, battleUIState, executeRound} = useBattleLogic(generateSampleOpponent());
    setupRound();

    await executeRound([nothingMove, nothingMove, nothingMove, nothingMove, nothingMove], true);

    // Back to waiting due to setupRound call.
    expect(battleUIState()).toBe(BattleUIState.WAITING);

  })
});

describe("useBattleLogic sequence eval basics", () => {
  it("Attack damage dealt", async () => {
    const {opponent, setupRound, executeRound, player} = useBattleLogic(generateSampleOpponent([playerMoves.attack, playerMoves.attack, nothingMove, nothingMove, nothingMove]));
    setupRound();

    await executeRound([playerMoves.attack, nothingMove, nothingMove, nothingMove, nothingMove], true);

    expect(opponent.health).toBe(opponent.maxHealth - 1);
    expect(player.health).toBe(player.maxHealth - 2);
  });

  it("Repeat performs attack twice", async () => {
    const {opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent());
    setupRound();

    await executeRound([playerMoves.attack, playerMoves.repeat, nothingMove, nothingMove, nothingMove], true);

    expect(opponent.health).toBe(opponent.maxHealth - 2);
  })

  it("Defend reduces incoming damage", async () => {
    const {opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([playerMoves.defend, playerMoves.defend, nothingMove, nothingMove, nothingMove]));
    setupRound();

    await executeRound([playerMoves.attack, nothingMove, nothingMove, nothingMove, nothingMove], true);

    expect(opponent.health).toBe(opponent.maxHealth - 0.5);

    opponent.health = opponent.maxHealth;

    await executeRound([playerMoves.prepare, playerMoves.attack, nothingMove, nothingMove, nothingMove], true);

    expect(opponent.health).toBe(opponent.maxHealth - 1); // 2x damage then halved by defend.
  });

  it("Heal fails based on RequiresFocus", async () => {
    const {opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([playerMoves.heal, nothingMove, nothingMove, nothingMove, nothingMove]));
    setupRound();
    opponent.takeDamage(10);
    await executeRound([playerMoves.attack, nothingMove, nothingMove, nothingMove, nothingMove], true);

    expect(opponent.health).toBeLessThan(opponent.maxHealth - 10); // 2 from attack on vuln, 10 manually decremented to verify.
    
  });

  it("Heal succeeds with focus", async () => {
    const {opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([playerMoves.heal, nothingMove, nothingMove, nothingMove, nothingMove]));
    setupRound();
    opponent.takeDamage(10);
    await executeRound([playerMoves.defend, playerMoves.heal, nothingMove, nothingMove, nothingMove], true);

    expect(opponent.health).toBeGreaterThan(opponent.maxHealth - 10);
  });

  it("Prepare adds status on success", async () => {
    const {opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([nothingMove, nothingMove, nothingMove, nothingMove, playerMoves.prepare]));
    setupRound();
    await executeRound([playerMoves.evade, playerMoves.prepare, nothingMove, nothingMove, nothingMove], true);

    expect(opponent.getStatusLevel("prepared")).toBe(1);
  });

  it("Prepare fails without focus", async () => {
    const {opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([nothingMove, nothingMove, nothingMove, nothingMove, playerMoves.prepare]));
    setupRound();
    await executeRound([nothingMove, nothingMove, nothingMove, nothingMove, playerMoves.attack], true);

    expect(opponent.getStatusLevel("prepared")).toBe(0);
  });

  it("Overwhelm lands on defensive moves", async () => {
    const {player, setupRound, executeRound, opponent} = useBattleLogic(generateSampleOpponent([playerMoves.overwhelm, playerMoves.overwhelm, nothingMove, nothingMove, nothingMove]));
    setupRound();
    await executeRound([playerMoves.defend, playerMoves.evade, nothingMove, nothingMove, nothingMove], true);

    expect(player.health).toBe(player.maxHealth - 2);
    expect(opponent.health).toBe(opponent.maxHealth); // Weird bug that I noticed playtesting.
  });

  it("Overwhelm fails with vulnerability on non-defensive moves", async () => {
    const {player, opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([playerMoves.overwhelm, playerMoves.overwhelm, nothingMove, nothingMove, nothingMove]));
    setupRound();
    await executeRound([playerMoves.attack, nothingMove, nothingMove, nothingMove, nothingMove], true);

    expect(player.health).toBe(player.maxHealth);
    expect(opponent.health).toBe(opponent.maxHealth - 1.5); // -1.5 from vuln. <- NOTE TO SELF I SHOULD PROB MAKE THIS SOME SORT OF CONFIG CONSTANT LOL.
  })

  it("Prepare attack does bonus damage", async () => {
    const {opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent());
    setupRound();
    await executeRound([playerMoves.prepare, playerMoves.attack, nothingMove, nothingMove, nothingMove], true);
    expect(opponent.health).toBe(opponent.maxHealth - 2);
    opponent.heal(999);
    await(executeRound([playerMoves.prepare, playerMoves.repeat, playerMoves.attack, nothingMove, nothingMove], true));
    expect(opponent.health).toBe(opponent.maxHealth - 4);
  });

  it("Prepare wraps to next turn", async () => {
    const {player, opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent());
    setupRound();
    await executeRound([nothingMove, nothingMove, nothingMove, nothingMove, playerMoves.prepare], true);
    expect(player.getStatusLevel("prepared")).toBe(1);
    await executeRound([playerMoves.attack, nothingMove, nothingMove, nothingMove, nothingMove], true);
    expect(opponent.health).toBe(opponent.maxHealth - 2);
  })

  it("Evade negates damage with chance", async () => {
    const {player, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([playerMoves.attack, nothingMove, nothingMove, nothingMove, nothingMove]));
    setupRound();

    let evadeSuccessCount = 0;
    let evadeFailCount = 0;
    const testRuns = 1000; // Lower sample sizes can sometimes trigger a fail within expected range.

    for (let i = 0; i < testRuns; i++) {
      await executeRound([playerMoves.evade, nothingMove, nothingMove, nothingMove, nothingMove], true);
      if (player.health === player.maxHealth) {
        evadeSuccessCount++;
      } else {
        evadeFailCount++;
      }
      player.health = player.maxHealth;
    }

    const evadeSuccessRate = evadeSuccessCount / testRuns;
    expect(evadeSuccessRate).toBeGreaterThan(0.45);
    expect(evadeSuccessRate).toBeLessThan(0.55);
  });

  it("Evade chance scales with prepare", async () => {
    const {player, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([nothingMove, playerMoves.attack, nothingMove, nothingMove, nothingMove]));
    setupRound();

    let evadeSuccessCount = 0;
    let evadeFailCount = 0;
    const testRuns = 1000; // Lower sample sizes can sometimes trigger a fail within expected range.

    for (let i = 0; i < testRuns; i++) {
      await executeRound([playerMoves.prepare, playerMoves.evade, nothingMove, nothingMove, nothingMove], true);
      if (player.health === player.maxHealth) {
        evadeSuccessCount++;
      } else {
        evadeFailCount++;
      }
      player.health = player.maxHealth;
    }

    const evadeSuccessRate = evadeSuccessCount / testRuns;
    expect(evadeSuccessRate).toBeGreaterThan(0.65);
    expect(evadeSuccessRate).toBeLessThan(0.85);
  });

  it("Evade Gauranteed On Prepare Repeat", async () => {
    const {player, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([nothingMove, nothingMove, playerMoves.attack, nothingMove, nothingMove]));
    setupRound();
    await executeRound([playerMoves.prepare, playerMoves.repeat, playerMoves.evade, nothingMove, nothingMove], true);
    expect(player.health).toBe(player.maxHealth);
  });

  it("Evade counterattack bonus (mania)", async () => {
    const {player, setupRound, executeRound, opponent} = useBattleLogic(generateSampleOpponent([nothingMove, nothingMove, playerMoves.attack, nothingMove, nothingMove]));
    setupRound();
    await executeRound([playerMoves.prepare, playerMoves.repeat, playerMoves.evade, playerMoves.attack, nothingMove], true);
    expect(player.health).toBe(player.maxHealth);
    expect(opponent.health).toBe(opponent.maxHealth - 2);
  });

  it("Evade counterattack doesn't apply when not actually attacked", async () => {
    const {player, setupRound, executeRound} = useBattleLogic(generateSampleOpponent());
    setupRound();
    await executeRound([nothingMove, nothingMove, nothingMove, nothingMove, playerMoves.evade], true);
    expect(player.getStatusLevel("mania")).toBe(0);
    
  })

  it("Heal scales on prepared", async () => {
    const {player, setupRound, executeRound} = useBattleLogic(generateSampleOpponent());
    setupRound();
    player.maxHealth = 100;
    player.health = 90;
    await executeRound([playerMoves.prepare, playerMoves.heal, nothingMove, nothingMove, nothingMove], true);
    let healAmountPrep = player.health - 90;

    player.health = 90;
    await executeRound([nothingMove, playerMoves.heal, nothingMove, nothingMove, nothingMove], true);
    let healAmountNorm = player.health - 90;

    expect(healAmountPrep).greaterThan(healAmountNorm);

  });
})

describe("Mirror Move", () => {
  it("Mirror move exists", () => {
    expect(Object.keys(playerMoves)).contains("mirror")
  })

  it("Mirror clones basic move", async () => {
    const {player, opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([playerMoves.attack, nothingMove, nothingMove, nothingMove, nothingMove]));

    setupRound();

    await executeRound([playerMoves.mirror, nothingMove, nothingMove, nothingMove, nothingMove], true);

    expect(player.health).toBe(player.maxHealth - 1);
    expect(opponent.health).toBe(opponent.maxHealth - 1);
  })

  it("Prepare mirror properly scales move output", async () => {
    const {player, opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([nothingMove, playerMoves.attack, nothingMove, nothingMove, nothingMove]));

    setupRound();

    await executeRound([playerMoves.prepare, playerMoves.mirror, nothingMove, nothingMove, nothingMove], true);

    expect(player.health).toBe(player.maxHealth - 1);
    expect(opponent.health).toBe(opponent.maxHealth - 2);
  })

  it("Mirror repeat mirrors twice", async () => {
    const {opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([playerMoves.attack, playerMoves.attack, nothingMove, nothingMove, nothingMove]));

    setupRound();

    await executeRound([playerMoves.mirror, playerMoves.repeat, nothingMove, nothingMove, nothingMove], true);

    expect(opponent.health).toBe(opponent.maxHealth - 2);
  })

  it("Mirror on mirror fails", async () => {
    const {player, opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([playerMoves.mirror, nothingMove, nothingMove, nothingMove, nothingMove]));
    setupRound();
    await executeRound([playerMoves.mirror, nothingMove, nothingMove, nothingMove, nothingMove], true);
    expect(player.data.mirrorFatigue).toBe(true);
    expect(opponent.data.mirrorFatigue).toBe(true);
  })

  it("Opponent can use mirror", async () => {
    const {player, opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([playerMoves.mirror, nothingMove, nothingMove, nothingMove, nothingMove]));
    setupRound();
    await executeRound([playerMoves.attack, nothingMove, nothingMove, nothingMove, nothingMove], true);
    expect(player.health).toBe(player.maxHealth - 1);
    expect(opponent.health).toBe(opponent.maxHealth - 1);
  })

  it("Mirror applies status moves to self", async () => {
    const {player, opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([nothingMove, nothingMove, nothingMove, nothingMove, playerMoves.prepare]));
    setupRound();
    await executeRound([nothingMove, nothingMove, nothingMove, nothingMove, playerMoves.mirror], true);
    expect(player.getStatusLevel("prepared")).toBe(1);
    expect(opponent.getStatusLevel("prepared")).toBe(1);
  })

  it("Mirror on self-effecting moves (e.g heal) properly target self", async () => {
    const {player, opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([playerMoves.heal, nothingMove, nothingMove, nothingMove, nothingMove]));

    player.health = player.maxHealth = 100;

    player.takeDamage(5);
    opponent.takeDamage(5);

    setupRound();

    await executeRound([playerMoves.mirror, nothingMove, nothingMove, nothingMove, nothingMove], true);

    expect(opponent.health).toBeGreaterThan(opponent.maxHealth -5);
    expect(player.health).toBeGreaterThan(player.maxHealth - 5);

  })

  it("Mirror on repeat, runs *opponents* last move, not our own", async () => {
    const {player, opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([playerMoves.attack, playerMoves.repeat, nothingMove, nothingMove, nothingMove]));

    setupRound();

    await executeRound([nothingMove, playerMoves.mirror, nothingMove, nothingMove, nothingMove], true);

    expect(player.health).toBe(player.maxHealth - 2);
    expect(opponent.health).toBe(opponent.maxHealth -1); // We do opponents attack, not our nothingMove.

  })

  it("We can repeat mirror", async () => {
    const {opponent, setupRound, executeRound} = useBattleLogic(generateSampleOpponent([playerMoves.attack, playerMoves.attack, nothingMove, nothingMove, nothingMove]));

    setupRound();

    await executeRound([playerMoves.mirror, playerMoves.repeat, nothingMove, nothingMove, nothingMove], true);

    expect(opponent.health).toBe(opponent.maxHealth - 2);
  })
})

describe("Death tests", () => {
  it.each([0, 1, 2, 3, 4])("Player death idx %i", async (index) => {
    const { player, setupRound, executeRound, battleUIState } = useBattleLogic(
        generateSampleOpponent([
            ...Array(index).fill(nothingMove), // Fill with no moves until the attack index
            playerMoves.attack, // Opponent attacks at the given index
            ...Array(4 - index).fill(nothingMove) // Fill the remaining moves
        ])
    );

    player.health = 0.5; // Ensure the player is low enough to die from an attack

    setupRound();

    await executeRound(Array(5).fill(nothingMove), true); // Player does nothing

    expect(battleUIState()).toBe(BattleUIState.END);
});

it.each([0, 1, 2, 3, 4])("Opponent death idx %i", async (index) => {
    const { opponent, setupRound, executeRound, battleUIState } = useBattleLogic(
        generateSampleOpponent([
            ...Array(index).fill(nothingMove), // Fill with no moves until the attack index
            nothingMove, // Opponent does nothing (player attacks)
            ...Array(4 - index).fill(nothingMove) // Fill the remaining moves
        ])
    );

    opponent.health = 0.5; // Ensure the opponent is low enough to die

    setupRound();

    const moves = Array(5).fill(nothingMove);
    moves[index] = playerMoves.attack; // Player attacks at this index

    await executeRound(moves, true);

    expect(battleUIState()).toBe(BattleUIState.END);
});
})