import '@/shared/styles/base.css'

import Battle from "@/features/battle/Battle";
import { OpponentProfile, PlayerProfile } from '@/features/battle/bridge/battleProfiles';
import { createMemo, createSignal, For, Show } from 'solid-js';
import { render } from "solid-js/web";

const plyr: PlayerProfile = {
    display: {
        name: 'The Player',
        lexicon: {
            attack: {
                label: 'overwritten'
            }
        }
    }
}

const BATTLE_IMPORTS = import.meta.glob('@/data/battles/*.ts', {
    eager: true
}) as Record<string, Record<string, unknown>>;

// im gonna be honest this is some gpt voodoo idk how its parsing the files lol.
const allBattles = Object.entries(BATTLE_IMPORTS)
    .map(([path, mod]) => {
        const profile = Object.values(mod).find((value): value is OpponentProfile => {
            return !!value && typeof value === 'object' && 'display' in value && 'logic' in value;
        });

        if (!profile) return null;

        const slug = path.split('/').pop()?.replace(/\.ts$/, '') ?? path;
        return {
            key: slug,
            label: profile.display.name || slug,
            profile
        };
    })
    .filter((battle): battle is { key: string, label: string, profile: OpponentProfile } => battle !== null)
    .sort((a, b) => a.label.localeCompare(b.label));

const [selectedBattleKey, setSelectedBattleKey] = createSignal(allBattles[0]?.key ?? '');
const selectedBattle = createMemo(() => {
    const key = selectedBattleKey();
    return allBattles.find((battle) => battle.key === key)?.profile ?? allBattles[0]?.profile;
});

const root = document.getElementById('root');
render(() => (
    <main id="game-root">
        <label style={{ position: 'fixed', top: '-30px', left: '-30px', 'z-index': '20', display: 'flex', gap: '0.5rem', 'align-items': 'center' }}>
            <span>Battle:</span>
            <select value={selectedBattleKey()} onInput={(e) => setSelectedBattleKey(e.currentTarget.value)} name='mold'>
                <For each={allBattles}>
                    {(battle) => <option value={battle.key}>{battle.label}</option>}
                </For>
            </select>
        </label>
        <Show when={selectedBattle()} keyed>
            {(opponentProfile) => (
                <Battle opponentProfile={opponentProfile} playerProfile={plyr} onEnd={(o) => alert('Battele End: ' + o)} skipOpeningAnimation={true} />
            )}
        </Show>
        <div id="modal-root"/>
    </main>
)
, root!)
