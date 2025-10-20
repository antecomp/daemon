import { OpponentAI, OpponentStats } from '@/core/battlenew/ai/opponentAI.types';
import { Point } from '@/shared/types/3d.types';
import { AssetURL } from '@/shared/types/misc.types';
import { MoveLexicon } from '../lexicon/lexicon.types';
import { Combatant } from '@/core/battlenew/model/combatant';
import { ActionMessageAppender } from './actionMessages';
import { Sides } from '@/core/battlenew/utils/sides.utils';

export type OpponentDisplayPredicateArgs = {combatants: Sides<Combatant>} // Or whatever other needed for conditions
export type OpponentDisplayBehaviorDeps = {appendActionMessage: ActionMessageAppender}

export interface OpponentDisplayBehavior {
    key: string;
    when?: (args: OpponentDisplayPredicateArgs) => boolean; 
    run: (deps: OpponentDisplayBehaviorDeps) => void;
    once?: boolean
}

export interface OpponentProfile {
    display: {
        name: string;
        icon: AssetURL;
        lexicon: Partial<MoveLexicon>;

        sprite: AssetURL;
        spriteOffset?: Point;

        backgroundShader: string;
        backgroundShaderTexture?: AssetURL;

        // UI-Based Contextual Behaviors.
        behaviors?: {
            preRound?: OpponentDisplayBehavior[]
            postRound?: OpponentDisplayBehavior[]
        }
    };

    logic: {
        ai: OpponentAI;
        stats: OpponentStats;
    };
}

export interface PlayerProfile {
    display: {
        lexicon: Partial<MoveLexicon>;
    };
}
