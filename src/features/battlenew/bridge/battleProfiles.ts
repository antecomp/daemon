import { OpponentAI, OpponentStats } from '@/core/battlenew/ai/opponentAI.types';
import { Point } from '@/shared/types/3d.types';
import { AssetURL } from '@/shared/types/misc.types';
import { MoveLexicon } from '../lexicon/lexicon.types';


export interface OpponentProfile {
    display: {
        name: string;
        icon: AssetURL;
        lexicon: Partial<MoveLexicon>;

        sprite: AssetURL;
        spriteOffset?: Point;

        backgroundShader: string;
        backgroundShaderTexture?: AssetURL;
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
