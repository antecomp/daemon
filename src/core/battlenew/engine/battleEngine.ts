//export function createBattleEngine(opponentAI, reactionmap, deps);

// need hook for like useUIBattleEngine or some better name, that runs the above but 
// injects all the Solid/Anim shit into reactionmap that we want, configires the UI,
// uses opponentProfile instead of opponentAI. opponentProfile used to configure UI shit beforehand
// configured UI handlers are *then* passed as part of the reactionmap