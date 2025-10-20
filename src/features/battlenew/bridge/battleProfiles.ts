import { OpponentAI, OpponentStats } from '@/core/battlenew/ai/opponentAI.types';
import { Point } from '@/shared/types/3d.types';
import { AssetURL } from '@/shared/types/misc.types';
import { MoveLexicon } from '../lexicon/lexicon.types';
import { Combatant } from '@/core/battlenew/model/combatant';
import { ActionMessageAppender } from './actionMessages';
import { Sides } from '@/core/battlenew/utils/sides.utils';


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
            preRound?: (combatants: Sides<Combatant>, deps: {appendActionMessage: ActionMessageAppender}) => void;
            postRound?: (combatants: Sides<Combatant>, deps: {appendActionMessage: ActionMessageAppender}) => void;
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
