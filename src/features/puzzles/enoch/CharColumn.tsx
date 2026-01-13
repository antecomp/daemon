export default function CharColumn(
    props: {
        text: string,
        index: () => number,
        setIndex: (v: number | ((p: number) => number)) => void,
        visible?: number;
        rowHeight?: number;
        durationMs?: number;
    }
) {
    return 'X';
}