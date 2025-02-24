import { describe, it, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { useBattleLogic } from "@/core/battle/engine/battle.logic";
import { Actor } from "@/core/battle/engine/actor";
import { Status } from "@/core/battle/engine/statuses";
import { MultiplierSet } from "@/core/battle/engine/battle.types";
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
})