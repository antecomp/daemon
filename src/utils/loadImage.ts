import { AssetURL } from "@/extra.types";

export function loadImage(src: AssetURL): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            img.decode();
            resolve(img);
        };
        img.onerror = reject;
        img.src = src;
    })
}