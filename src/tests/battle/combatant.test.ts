import { Combatant } from "@/core/battle/model/combatant";
import { Status } from "@/core/battle/model/status";
import { describe, expect, test } from "vitest";

class PreparedStatus extends Status {
    name = "prepared";
}

class VulnerableStatus extends Status {
    name = "vulnerable";
}

describe("Combatant", () => {
    test("initializes with full health and empty snapshot", () => {
        const combatant = new Combatant(20);

        expect(combatant.maxHealth).toBe(20);
        expect(combatant.health).toBe(20);
        expect(combatant.healthPercent).toBe(100);
        expect(combatant.isDead).toBe(false);
        expect(combatant.snapshot()).toEqual({
            health: 20,
            maxHealth: 20,
            statuses: {}
        });
    });

    test("takeDamage updates health and returns damage mutation snapshot", () => {
        const combatant = new Combatant(20);

        const mutation = combatant.takeDamage(7);

        expect(combatant.health).toBe(13);
        expect(combatant.isDead).toBe(false);
        expect(combatant.healthPercent).toBe(65);

        expect(mutation.kind).toBe("damage");
        if (mutation.kind == 'damage') {
            expect(mutation.amount).toBe(7);
            expect(mutation.dead).toBe(false);
        }
        expect(mutation.before).toEqual({ health: 20, maxHealth: 20, statuses: {} });
        expect(mutation.after).toEqual({ health: 13, maxHealth: 20, statuses: {} });
    });

    test("takeDamage clamps at zero and reports dead in mutation", () => {
        const combatant = new Combatant(20);

        const mutation = combatant.takeDamage(999);

        expect(combatant.health).toBe(0);
        expect(combatant.isDead).toBe(true);
        expect(combatant.healthPercent).toBe(0);

        expect(mutation.kind).toBe("damage");
        if (mutation.kind == 'damage') {
            expect(mutation.amount).toBe(999);
            expect(mutation.dead).toBe(true);
        }
        expect(mutation.before).toEqual({ health: 20, maxHealth: 20, statuses: {} });
        expect(mutation.after).toEqual({ health: 0, maxHealth: 20, statuses: {} });
    });

    test("heal restores health and returns heal mutation snapshot", () => {
        const combatant = new Combatant(20);
        combatant.takeDamage(10);

        const mutation = combatant.heal(6);

        expect(combatant.health).toBe(16);
        expect(combatant.healthPercent).toBe(80);

        expect(mutation.kind).toBe("heal");
        if (mutation.kind == 'heal') {
            expect(mutation.amount).toBe(6);
            expect(mutation.maxxedOut).toBe(false);
        }
        expect(mutation.before).toEqual({ health: 10, maxHealth: 20, statuses: {} });
        expect(mutation.after).toEqual({ health: 16, maxHealth: 20, statuses: {} });
    });

    test("heal clamps at max health and sets maxxedOut", () => {
        const combatant = new Combatant(20);
        combatant.takeDamage(3);

        const mutation = combatant.heal(999);

        expect(combatant.health).toBe(20);
        expect(mutation.kind).toBe("heal");
        if (mutation.kind == 'heal') {
            expect(mutation.amount).toBe(999);
            expect(mutation.maxxedOut).toBe(true);
        }
        expect(mutation.before).toEqual({ health: 17, maxHealth: 20, statuses: {} });
        expect(mutation.after).toEqual({ health: 20, maxHealth: 20, statuses: {} });
    });

    test("addStatus stacks durations and exposes levels through status getters", () => {
        const combatant = new Combatant(20);
        const prepared = new PreparedStatus();

        const m1 = combatant.addStatus(prepared, 3);
        const m2 = combatant.addStatus(prepared, 1);

        expect(m1.kind).toBe("status:add");
        if (m1.kind == 'status:add') expect(m1.statusName).toBe("prepared");
        expect(m1.before.statuses).toEqual({});
        expect(m1.after.statuses).toEqual({ prepared: { maxDur: 3, level: 1 } });

        expect(m2.kind).toBe("status:add");
        if (m2.kind == 'status:add') expect(m2.statusName).toBe("prepared");
        expect(m2.before.statuses).toEqual({ prepared: { maxDur: 3, level: 1 } });
        expect(m2.after.statuses).toEqual({ prepared: { maxDur: 3, level: 2 } });

        expect(combatant.getStatusAndLevel("prepared")).toEqual([prepared, 2]);
        expect(combatant.getStatusLevel("prepared")).toBe(2);
        expect(combatant.getStatusLevel("missing")).toBe(0);
        expect(combatant.activeStatuses).toEqual([[prepared, 2]]);
    });

    test("tickStatuses decrements durations and mutation includes snapshot diff", () => {
        const combatant = new Combatant(20);
        const prepared = new PreparedStatus();
        combatant.addStatus(prepared, 2);
        combatant.addStatus(prepared, 1);

        const mutation = combatant.tickStatuses();

        expect(mutation.kind).toBe("statuses:tick");
        expect(mutation.before.statuses).toEqual({ prepared: { maxDur: 2, level: 2 } });
        expect(mutation.after.statuses).toEqual({ prepared: { maxDur: 1, level: 2 } });

        expect(combatant.getStatusLevel("prepared")).toBe(1);
        expect(combatant.getStatusLevelIncludingExpired("prepared")).toBe(2);
        expect(combatant.activeStatuses).toEqual([[prepared, 1]]);
    });

    test("extendStatus works for string and Status args and reports mutation", () => {
        const combatant = new Combatant(20);
        const prepared = new PreparedStatus();
        const vulnerable = new VulnerableStatus();

        combatant.addStatus(prepared, 1);
        combatant.addStatus(prepared, 2);
        combatant.addStatus(vulnerable, 1);

        const byName = combatant.extendStatus("prepared", 2);
        const byStatus = combatant.extendStatus(vulnerable, 3);
        const missing = combatant.extendStatus("missing", 5);

        expect(byName.kind).toBe("status:extend");
        if (byName.kind == 'status:extend') expect(byName.statusName).toBe("prepared");
        expect(byName.before.statuses).toEqual({
            prepared: { maxDur: 2, level: 2 },
            vulnerable: { maxDur: 1, level: 1 }
        });
        expect(byName.after.statuses).toEqual({
            prepared: { maxDur: 4, level: 2 },
            vulnerable: { maxDur: 1, level: 1 }
        });

        expect(byStatus.kind).toBe("status:extend");
        if (byStatus.kind == 'status:extend') expect(byStatus.statusName).toBe("vulnerable");
        expect(byStatus.after.statuses).toEqual({
            prepared: { maxDur: 4, level: 2 },
            vulnerable: { maxDur: 4, level: 1 }
        });

        expect(missing.kind).toBe("status:extend");
        if (missing.kind == 'status:extend') expect(missing.statusName).toBe("missing");
        expect(missing.before).toEqual(missing.after);
    });

    test("reapExpiredStatuses removes fully expired statuses and reports mutation", () => {
        const combatant = new Combatant(20);
        const prepared = new PreparedStatus();
        const vulnerable = new VulnerableStatus();

        combatant.addStatus(prepared, 1);
        combatant.addStatus(vulnerable, 3);
        combatant.tickStatuses();

        const mutation = combatant.reapExpiredStatuses();

        expect(mutation.kind).toBe("statuses:reap");
        expect(mutation.before.statuses).toEqual({
            prepared: { maxDur: 0, level: 1 },
            vulnerable: { maxDur: 2, level: 1 }
        });
        expect(mutation.after.statuses).toEqual({
            vulnerable: { maxDur: 2, level: 1 }
        });

        expect(combatant.getStatusLevel("prepared")).toBe(0);
        expect(combatant.getStatusLevel("vulnerable")).toBe(1);
        expect(combatant.activeStatuses).toEqual([[vulnerable, 1]]);
    });
});
