import { Side, sides } from "@/core/battle/utils/sides.utils";
import { DramaData, DramaDependancies, DramaEntry, DramaTable } from "./drama.types";

type SideSpec = {
  place: number | ((side: Side) => number);
  when: (data: DramaData, side: Side) => boolean | undefined;
  run: (deps: DramaDependancies, data: DramaData, side: Side) => Promise<unknown> | void;
};

type SideOverrides = Partial<Record<Side, Partial<SideSpec>>>;

export function defineSideDrama(
  id: string,
  base: SideSpec,
  overrides: SideOverrides = {},
  runFor: Side[] = [...sides],
): DramaTable {
  const out: DramaTable = {};
  for (const side of runFor) {
    const spec = { ...base, ...(overrides[side] ?? {}) };
    const place = typeof spec.place === "function" ? spec.place(side) : spec.place;
    out[`${id}-${side}`] = {
      place,
      when: (data) => spec.when(data, side),
      run: (deps, data) => spec.run(deps, data, side),
    } as DramaEntry;
  }
  return out;
}