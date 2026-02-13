import { Obligations } from "@/shared/utils/obligation";
import { describe, expect, test, vi } from "vitest";

describe("Obligation constructor", () => {
    test("Initializes with proper input", () => {
        function someFunc(arg: number) { return arg };
        const anotherFunc = () => { };
        expect(() => new Obligations(someFunc, anotherFunc)).not.toThrowError();
    });

    test("Constructor throws for anonymous functions", () => {
        expect(() => new Obligations(() => { })).toThrowError();
        expect(() => new Obligations(function () { })).toThrowError();
    })
});

describe("AddObligation", () => {
    test("Can add obligation with named function", () => {
        function someFunc(){};
        const obl = new Obligations();
        obl.addObligation(someFunc);
        expect(() => obl.run('someFunc')).not.toThrowError();
    });

    test("Can override obligation name", () => {
        function someFunc(){};
        const funcName = "JFDHS";
        const obl = new Obligations();
        obl.addObligation(someFunc, funcName);
        expect(() => obl.run(funcName)).not.toThrowError();
        expect(() => obl.run('someFunc')).toThrowError();
    });

    test("addObligation requires name for anonymous functions", () => {
        const obl = new Obligations();
        expect(() => obl.addObligation(() => {})).toThrowError();
        expect(() => obl.addObligation(() => {}, "name")).not.toThrowError();
    })
})

// Cannot use vi.fn() because it does not set the functions name based on the variable the mock is assigned to.
describe("Can run obligations", () => {
    test("Defined in constructor", () => {
        let x = 0;
        const someFunc = () => { x += 1 };
        const anotherFunc = () => { x += 2 };
        const obl = new Obligations(someFunc, anotherFunc);
        obl.run('someFunc');
        obl.run('anotherFunc');
        expect(x).toBe(3);
    });

    test("Defined later with addObligation", () => {
        let x = 0;
        const someFunc = () => { x += 1 };
        const anotherFunc = () => { x += 2 };
        const obl = new Obligations();
        obl.addObligation(someFunc);
        obl.addObligation(anotherFunc);
        obl.run('someFunc');
        obl.run('anotherFunc');
        expect(x).toBe(3);
    });

    test("Multiple times", () => {
        let x = 0;
        const someFunc = () => { x += 1 };
        const anotherFunc = () => { x += 2 };
        const obl = new Obligations(someFunc);
        obl.addObligation(anotherFunc);
        obl.run('someFunc');
        obl.run('someFunc');
        obl.run('anotherFunc');
        obl.run('anotherFunc');
        expect(x).toBe(6);        
    })
});

describe("resolveObligations", () => {
    test("Resolves uncalled obligations", () => {
        const mock1 = vi.fn();
        const mock2 = vi.fn();
        const obl = new Obligations();
        obl.addObligation(mock1, 'mock1');
        obl.addObligation(mock2, 'mock2');
        obl.resolveObligations();
        expect(mock1).toHaveBeenCalled();
        expect(mock2).toHaveBeenCalled();
    });

    test("Skips already called obligations", () => {
        const mock1 = vi.fn();
        const mock2 = vi.fn();
        const obl = new Obligations();
        obl.addObligation(mock1, 'mock1');
        obl.addObligation(mock2, 'mock2');
        obl.run('mock1');
        obl.resolveObligations();
        expect(mock1).toHaveBeenCalledOnce();
        expect(mock2).toHaveBeenCalledOnce();
    })
});